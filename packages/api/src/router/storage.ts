import { j, privateProcedure } from "../jstack"
import { getUploadUrlInputSchema } from "../validators/storage"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { HTTPException } from "hono/http-exception"
import { and, eq } from "drizzle-orm"
import { workspace, workspaceMember } from "@feedgot/db"

function getEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-")
}

export function createStorageRouter() {
  return j.router({
    getUploadUrl: privateProcedure
      .input(getUploadUrlInputSchema)
      .post(async ({ ctx, input, c }: any) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })
        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          const isBrandingUpload = String(input.folder || "").startsWith("branding/")
          if (me?.role === "admin" || me?.role === "member" || (isBrandingUpload && perms?.canConfigureBranding === true)) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })
        const accountId = getEnv("R2_ACCOUNT_ID")
        const accessKeyId = getEnv("R2_ACCESS_KEY_ID")
        const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY")
        const bucket = getEnv("R2_BUCKET")
        const publicBase = getEnv("R2_PUBLIC_BASE_URL")

        const endpoint = `https://${accountId}.r2.cloudflarestorage.com`
        const s3 = new S3Client({
          region: "auto",
          endpoint,
          credentials: { accessKeyId, secretAccessKey },
          forcePathStyle: true,
        })

        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const safe = sanitizeName(input.fileName)
        const folder = input.folder?.trim() || "branding/logo"
        const key = `workspaces/${input.slug}/${folder}/${id}-${safe}`

        const cmd = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: input.contentType,
        })
        const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 })
        const publicUrl = `${publicBase}/${key}`
        return c.json({ uploadUrl, key, publicUrl })
      }),
  })
}
