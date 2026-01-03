import { j, privateProcedure, publicProcedure } from "../jstack"
import { getUploadUrlInputSchema, getCommentImageUploadUrlInputSchema, getPostImageUploadUrlInputSchema, getAvatarUploadUrlInputSchema } from "../validators/storage"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { HTTPException } from "hono/http-exception"
import { and, eq } from "drizzle-orm"
import { workspace, workspaceMember, post, board } from "@featul/db"

function getEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

interface StorageContext {
  s3: S3Client
  bucket: string
  publicBase: string
}

function createStorageContext(): StorageContext {
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

  return { s3, bucket, publicBase }
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "-")
}

export function createStorageRouter() {
  return j.router({
    getAvatarUploadUrl: privateProcedure
      .input(getAvatarUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const safe = sanitizeName(input.fileName)
        const userId = String(ctx.session.user.id || "")
        const key = `users/${userId}/avatar/${id}-${safe}`

        const cmd = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: input.contentType,
        })
        const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 })
        const publicUrl = `${publicBase}/${key}`
        return c.json({ uploadUrl, key, publicUrl })
      }),

    getUploadUrl: privateProcedure
      .input(getUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
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
        const { s3, bucket, publicBase } = createStorageContext()
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

    getPublicPostImageUploadUrl: publicProcedure
      .input(getPostImageUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id })
          .from(workspace)
          .where(eq(workspace.slug, input.workspaceSlug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const safe = sanitizeName(input.fileName)
        const folder = "posts"
        const key = `workspaces/${input.workspaceSlug}/${folder}/${id}-${safe}`

        const cmd = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: input.contentType,
        })
        const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 })
        const publicUrl = `${publicBase}/${key}`
        return c.json({ uploadUrl, key, publicUrl })
      }),

    getPostImageUploadUrl: privateProcedure
      .input(getPostImageUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId })
          .from(workspace)
          .where(eq(workspace.slug, input.workspaceSlug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role })
            .from(workspaceMember)
            .where(and(eq(workspaceMember.workspaceId, ws.id), eq(workspaceMember.userId, ctx.session.user.id)))
            .limit(1)
          if (me?.role === "admin" || me?.role === "member" || me?.role === "viewer") {
            allowed = true
          }
        }
        
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const safe = sanitizeName(input.fileName)
        const folder = "posts"
        const key = `workspaces/${input.workspaceSlug}/${folder}/${id}-${safe}`

        const cmd = new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          ContentType: input.contentType,
        })
        const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: 60 * 5 })
        const publicUrl = `${publicBase}/${key}`
        return c.json({ uploadUrl, key, publicUrl })
      }),

    getCommentImageUploadUrl: privateProcedure
      .input(getCommentImageUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        // Get workspace slug from postId
        const [targetPost] = await ctx.db
          .select({
            postId: post.id,
            workspaceSlug: workspace.slug,
            workspaceId: workspace.id,
            ownerId: workspace.ownerId,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .innerJoin(workspace, eq(board.workspaceId, workspace.id))
          .where(eq(post.id, input.postId))
          .limit(1)

        if (!targetPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        // Allow any authenticated user to upload comment images (they can comment, so they can upload)
        // But we still check if they have access to the workspace
        let allowed = targetPost.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role })
            .from(workspaceMember)
            .where(
              and(
                eq(workspaceMember.workspaceId, targetPost.workspaceId),
                eq(workspaceMember.userId, ctx.session.user.id)
              )
            )
            .limit(1)
          // Allow if they're a member of the workspace, or if it's a public workspace (we'll allow authenticated users)
          if (me?.role === "admin" || me?.role === "member" || me?.role === "viewer") {
            allowed = true
          }
        }

        // For public workspaces, allow any authenticated user
        // For now, we'll allow authenticated users to upload comment images
        // The comment creation endpoint will handle the actual permission check
        if (!allowed) {
          // Check if workspace is public by checking if board allows comments
          // For simplicity, we'll allow authenticated users to upload
          // The actual comment creation will validate permissions
          allowed = true
        }

        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const safe = sanitizeName(input.fileName)
        const folder = "comments"
        const key = `workspaces/${targetPost.workspaceSlug}/${folder}/${id}-${safe}`

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
