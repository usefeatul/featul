import { HTTPException } from "hono/http-exception"
import { and, eq, gt, isNull, sql } from "drizzle-orm"
import { j, publicProcedure, privateProcedure } from "../jstack"
import { workspace, workspaceSlugReservation } from "@oreilla/db"
import { reserveSlugInputSchema, tokenInputSchema, checkSlugPublicInputSchema } from "../validators/reservation"
import { sendReservationEmail } from "@oreilla/auth/email"

const BLOCKED_SLUGS = new Set([
  "admin","api","oreilla","feedback","www","app","support","help","mail","blog","status","docs","pricing","signup","signin","start","invite","reserve","verify","staging"
])
const MAX_RESERVATIONS_PER_EMAIL = 3

export function createReservationRouter() {
  return j.router({
    checkSlug: publicProcedure
      .input(checkSlugPublicInputSchema)
      .post(async ({ ctx, input, c }) => {
        const slug = input.slug.trim().toLowerCase()
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, slug))
          .limit(1)
        if (ws?.id) return c.superjson({ available: false, reason: "taken" })

        const now = new Date()
        const [resv] = await ctx.db
          .select({ id: workspaceSlugReservation.id, status: workspaceSlugReservation.status, expiresAt: workspaceSlugReservation.expiresAt })
          .from(workspaceSlugReservation)
          .where(eq(workspaceSlugReservation.slug, slug))
          .limit(1)
        const active = resv && resv.status === "reserved" && resv.expiresAt && resv.expiresAt.getTime() > now.getTime()
        return c.superjson({ available: !active, reason: active ? "reserved" : "available" })
      }),

    reserve: publicProcedure
      .input(reserveSlugInputSchema)
      .post(async ({ ctx, input, c }) => {
        const email = input.email.trim().toLowerCase()
        const slug = input.slug.trim().toLowerCase()
        if (BLOCKED_SLUGS.has(slug)) throw new HTTPException(403, { message: "Slug not allowed" })

        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, slug))
          .limit(1)
        if (ws?.id) throw new HTTPException(409, { message: "Slug is already taken" })

        const now = new Date()
        const windowStart = new Date(Date.now() - 60_000)
        const [recent] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(workspaceSlugReservation)
          .where(and(eq(workspaceSlugReservation.email, email), gt(workspaceSlugReservation.updatedAt, windowStart)))
          .limit(1)
        if (Number(recent?.count || 0) > 0) throw new HTTPException(429, { message: "Too many requests" })

        const [existing] = await ctx.db
          .select({ id: workspaceSlugReservation.id, email: workspaceSlugReservation.email, status: workspaceSlugReservation.status, expiresAt: workspaceSlugReservation.expiresAt, updatedAt: workspaceSlugReservation.updatedAt })
          .from(workspaceSlugReservation)
          .where(eq(workspaceSlugReservation.slug, slug))
          .limit(1)

        // If someone else holds an active reservation, block
        if (existing && existing.email !== email && existing.status === "reserved" && existing.expiresAt && existing.expiresAt.getTime() > now.getTime()) {
          throw new HTTPException(409, { message: "Slug is already reserved" })
        }

        // Enforce per-email max active reservations (excluding expired/cancelled/claimed)
        const [activeCountRes] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(workspaceSlugReservation)
          .where(and(eq(workspaceSlugReservation.email, email), eq(workspaceSlugReservation.status, 'reserved'), gt(workspaceSlugReservation.expiresAt, now)))
          .limit(1)
        const activeCount = Number(activeCountRes?.count || 0)
        const isSameRecord = existing && existing.email === email
        if (!isSameRecord && activeCount >= MAX_RESERVATIONS_PER_EMAIL) {
          throw new HTTPException(403, { message: "Reservation limit reached" })
        }

        const token = crypto.randomUUID()
        const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

        if (existing) {
          if (existing.email === email && existing.updatedAt && Date.now() - new Date(existing.updatedAt).getTime() < 60_000) {
            throw new HTTPException(429, { message: "Too many requests" })
          }
          await ctx.db
            .update(workspaceSlugReservation)
            .set({ email, token, status: "reserved", expiresAt: expires, updatedAt: new Date() })
            .where(eq(workspaceSlugReservation.id, existing.id))
        } else {
          await ctx.db.insert(workspaceSlugReservation).values({ slug, email, token, status: "reserved", expiresAt: expires })
        }

        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          const url = `${baseUrl}/reserve/${token}`
          await sendReservationEmail(email, slug, url)
        } catch {}

        return c.superjson({ ok: true, token })
      }),

    lookupByToken: publicProcedure
      .input(tokenInputSchema)
      .get(async ({ ctx, input, c }) => {
        const [r] = await ctx.db
          .select({ slug: workspaceSlugReservation.slug, email: workspaceSlugReservation.email, status: workspaceSlugReservation.status, expiresAt: workspaceSlugReservation.expiresAt })
          .from(workspaceSlugReservation)
          .where(eq(workspaceSlugReservation.token, input.token))
          .limit(1)
        if (!r) return c.superjson({ reservation: null })
        const expired = r.expiresAt && r.expiresAt.getTime() < Date.now()
        if (expired || r.status !== "reserved") return c.superjson({ reservation: null })
        return c.superjson({ reservation: { slug: r.slug, email: r.email } })
      }),

    confirm: publicProcedure
      .input(tokenInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [r] = await ctx.db
          .select({ id: workspaceSlugReservation.id, status: workspaceSlugReservation.status, expiresAt: workspaceSlugReservation.expiresAt })
          .from(workspaceSlugReservation)
          .where(eq(workspaceSlugReservation.token, input.token))
          .limit(1)
        if (!r) throw new HTTPException(404, { message: "Invalid reservation" })
        if (r.expiresAt && r.expiresAt.getTime() < Date.now()) throw new HTTPException(410, { message: "Reservation expired" })
        if (r.status !== "reserved") throw new HTTPException(409, { message: "Reservation not active" })

        await ctx.db
          .update(workspaceSlugReservation)
          .set({ updatedAt: new Date() })
          .where(eq(workspaceSlugReservation.id, r.id))

        return c.superjson({ ok: true })
      }),

    claimOnSignup: privateProcedure
      .get(async ({ ctx, c }) => {
        const me = ctx.session.user
        const email = (me?.email || '').toLowerCase()
        if (!email) return c.superjson({ slugLocked: null })
        const now = new Date()
        const [r] = await ctx.db
          .select({ id: workspaceSlugReservation.id, slug: workspaceSlugReservation.slug, email: workspaceSlugReservation.email, expiresAt: workspaceSlugReservation.expiresAt })
          .from(workspaceSlugReservation)
          .where(and(eq(workspaceSlugReservation.email, email), eq(workspaceSlugReservation.status, 'reserved')))
          .limit(1)
        const active = r && r.expiresAt && r.expiresAt.getTime() > now.getTime()
        return c.superjson({ slugLocked: active ? r?.slug || null : null })
      }),
  })
}
