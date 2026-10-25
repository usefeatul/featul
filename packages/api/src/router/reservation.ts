import { HTTPException } from "hono/http-exception"
import { and, eq, gt, isNotNull, isNull, sql } from "drizzle-orm"
import { j, publicProcedure, privateProcedure } from "../jstack"
import { workspace, workspaceSlugReservation } from "@featul/db"
import { reserveSlugInputSchema, tokenInputSchema, checkSlugPublicInputSchema } from "../validators/reservation"
import { sendReservationEmail } from "@featul/auth/email"
import { isReservedWorkspaceSlug } from "../workspace/slug"
import { isReservedSlugBlockedForEmail } from "../workspace/creator"
import { enforceTrustedBrowserOrigin } from "../request/origin"
import { applyRateLimitHeaders, limitReservation } from "../services/ratelimiter"
import {
  CONFIRMED_RESERVATION_TTL_MS,
  MAX_RESERVATIONS_PER_EMAIL,
  PENDING_RESERVATION_TTL_MS,
  isReservationLive,
} from "../workspace/reservation"

async function sendReservationEmailBestEffort(email: string, slug: string, token: string): Promise<void> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
    const url = `${baseUrl}/reserve/${token}`
    await sendReservationEmail(email, slug, url)
  } catch (error) {
    console.error("Failed to send reservation email", error)
  }
}

export function createReservationRouter() {
  return j.router({
    checkSlug: publicProcedure
      .input(checkSlugPublicInputSchema)
      .post(async ({ ctx, input, c }) => {
        const slug = input.slug.trim().toLowerCase()
        if (isReservedWorkspaceSlug(slug)) return c.superjson({ available: false, reason: "reserved" })
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
        const active = isReservationLive(resv, now)
        return c.superjson({ available: !active, reason: active ? "reserved" : "available" })
      }),

    reserve: publicProcedure
      .input(reserveSlugInputSchema)
      .post(async ({ ctx, input, c }) => {
        enforceTrustedBrowserOrigin(c.req.raw)
        const email = input.email.trim().toLowerCase()
        const slug = input.slug.trim().toLowerCase()
        if (isReservedSlugBlockedForEmail(slug, email)) throw new HTTPException(403, { message: "Slug not allowed" })

        applyRateLimitHeaders(c, await limitReservation(c.req.raw))

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
          .select({ id: workspaceSlugReservation.id, email: workspaceSlugReservation.email, status: workspaceSlugReservation.status, confirmedAt: workspaceSlugReservation.confirmedAt, expiresAt: workspaceSlugReservation.expiresAt })
          .from(workspaceSlugReservation)
          .where(eq(workspaceSlugReservation.slug, slug))
          .limit(1)

        if (existing && isReservationLive(existing, now)) {
          if (existing.email !== email) throw new HTTPException(409, { message: "Slug is already reserved" })
          // Same email already holds (or is confirming) this slug: don't send another email.
          return c.superjson({ ok: true })
        }

        // Pending and confirmed reservations both count, so one email can't receive endless links.
        const [activeCountRes] = await ctx.db
          .select({ count: sql<number>`count(*)` })
          .from(workspaceSlugReservation)
          .where(and(eq(workspaceSlugReservation.email, email), eq(workspaceSlugReservation.status, "reserved"), gt(workspaceSlugReservation.expiresAt, now)))
          .limit(1)
        if (Number(activeCountRes?.count || 0) >= MAX_RESERVATIONS_PER_EMAIL) {
          throw new HTTPException(403, { message: "Reservation limit reached" })
        }

        const token = crypto.randomUUID()
        const expires = new Date(now.getTime() + PENDING_RESERVATION_TTL_MS)

        if (existing) {
          await ctx.db
            .update(workspaceSlugReservation)
            .set({ email, token, status: "reserved", confirmedAt: null, claimedAt: null, claimedByUserId: null, expiresAt: expires, updatedAt: now })
            .where(eq(workspaceSlugReservation.id, existing.id))
        } else {
          const inserted = await ctx.db
            .insert(workspaceSlugReservation)
            .values({ slug, email, token, status: "reserved", expiresAt: expires })
            .onConflictDoNothing()
            .returning({ id: workspaceSlugReservation.id })
          if (inserted.length === 0) throw new HTTPException(409, { message: "Slug is already reserved" })
        }

        await sendReservationEmailBestEffort(email, slug, token)

        return c.superjson({ ok: true })
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
        enforceTrustedBrowserOrigin(c.req.raw)
        const [r] = await ctx.db
          .select({ id: workspaceSlugReservation.id, status: workspaceSlugReservation.status, confirmedAt: workspaceSlugReservation.confirmedAt, expiresAt: workspaceSlugReservation.expiresAt })
          .from(workspaceSlugReservation)
          .where(eq(workspaceSlugReservation.token, input.token))
          .limit(1)
        if (!r) throw new HTTPException(404, { message: "Invalid reservation" })
        if (r.expiresAt && r.expiresAt.getTime() < Date.now()) throw new HTTPException(410, { message: "Reservation expired" })
        if (r.status !== "reserved") throw new HTTPException(409, { message: "Reservation not active" })

        // Clicking the emailed link proves email ownership; only then does the slug hold.
        if (!r.confirmedAt) {
          const now = new Date()
          await ctx.db
            .update(workspaceSlugReservation)
            .set({ confirmedAt: now, expiresAt: new Date(now.getTime() + CONFIRMED_RESERVATION_TTL_MS), updatedAt: now })
            .where(and(eq(workspaceSlugReservation.id, r.id), isNull(workspaceSlugReservation.confirmedAt)))
        }

        return c.superjson({ ok: true })
      }),

    claimOnSignup: privateProcedure
      .get(async ({ ctx, c }) => {
        const me = ctx.session.user
        const email = (me?.email || '').toLowerCase()
        if (!email) return c.superjson({ slugLocked: null })
        const now = new Date()
        const [r] = await ctx.db
          .select({ slug: workspaceSlugReservation.slug })
          .from(workspaceSlugReservation)
          .where(and(
            eq(workspaceSlugReservation.email, email),
            eq(workspaceSlugReservation.status, 'reserved'),
            isNotNull(workspaceSlugReservation.confirmedAt),
            gt(workspaceSlugReservation.expiresAt, now),
          ))
          .limit(1)
        return c.superjson({ slugLocked: r?.slug || null })
      }),
  })
}
