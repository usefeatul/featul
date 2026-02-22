import { j, privateProcedure, publicProcedure } from "../jstack"
import { getUploadUrlInputSchema, getCommentImageUploadUrlInputSchema, getPostImageUploadUrlInputSchema, getAvatarUploadUrlInputSchema } from "../validators/storage"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { HTTPException } from "hono/http-exception"
import { and, eq } from "drizzle-orm"
import { workspace, workspaceMember, post, board } from "@featul/db"
import { auth } from "@featul/auth"
import { headers } from "next/headers"
import {
  SIGNED_UPLOAD_URL_TTL_SECONDS,
  AVATAR_UPLOAD_POLICY,
  POST_IMAGE_UPLOAD_POLICY,
  COMMENT_IMAGE_UPLOAD_POLICY,
  WORKSPACE_UPLOAD_POLICIES,
  resolveWorkspaceUploadFolder,
  validateUploadInput,
} from "../shared/storage-upload"
import {
  limitStorageAvatar,
  limitStorageWorkspace,
  limitStoragePublicPostAnon,
  limitStoragePublicPostUser,
  limitStorageMemberPost,
  limitStorageComment,
  type RateLimitResult,
} from "../services/ratelimiter"

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

function applyRateLimitHeaders(c: any, result: RateLimitResult): void {
  const resetInSeconds = Math.max(0, Math.ceil((result.reset - Date.now()) / 1000))
  c.header("X-RateLimit-Limit", String(result.limit))
  c.header("X-RateLimit-Remaining", String(Math.max(0, result.remaining)))
  c.header("X-RateLimit-Reset", String(resetInSeconds))

  if (!result.success) {
    c.header("Retry-After", String(Math.max(1, resetInSeconds)))
    throw new HTTPException(429, { message: "Too many upload URL requests. Please try again shortly." })
  }
}

async function getSessionUserId(rawHeaders: Headers): Promise<string | null> {
  try {
    const session = await auth.api.getSession({ headers: rawHeaders || (await headers()) })
    return session?.user?.id || null
  } catch {
    return null
  }
}

async function hasActiveWorkspaceMembership(ctx: any, workspaceId: string, userId: string): Promise<boolean> {
  const [member] = await ctx.db
    .select({ id: workspaceMember.id })
    .from(workspaceMember)
    .where(
      and(
        eq(workspaceMember.workspaceId, workspaceId),
        eq(workspaceMember.userId, userId),
        eq(workspaceMember.isActive, true)
      )
    )
    .limit(1)

  return Boolean(member?.id)
}

async function buildSignedUpload({
  s3,
  bucket,
  publicBase,
  key,
  contentType,
  contentLength,
}: {
  s3: S3Client
  bucket: string
  publicBase: string
  key: string
  contentType: string
  contentLength: number
}) {
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  })
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: SIGNED_UPLOAD_URL_TTL_SECONDS })
  const publicUrl = `${publicBase}/${key}`
  return { uploadUrl, key, publicUrl }
}

export function createStorageRouter() {
  return j.router({
    getAvatarUploadUrl: privateProcedure
      .input(getAvatarUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = String(ctx.session.user.id || "")
        if (!userId) throw new HTTPException(401, { message: "Unauthorized" })
        const avatarRateLimit = await limitStorageAvatar(userId)
        applyRateLimitHeaders(c, avatarRateLimit)

        const { safeFileName, normalizedContentType } = validateUploadInput({
          fileName: input.fileName,
          contentType: input.contentType,
          fileSize: input.fileSize,
          policy: AVATAR_UPLOAD_POLICY,
        })

        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const key = `users/${userId}/avatar/${id}-${safeFileName}`

        const payload = await buildSignedUpload({
          s3,
          bucket,
          publicBase,
          key,
          contentType: normalizedContentType,
          contentLength: input.fileSize,
        })
        return c.json(payload)
      }),

    getUploadUrl: privateProcedure
      .input(getUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = String(ctx.session.user.id || "")
        const workspaceRateLimit = await limitStorageWorkspace(userId)
        applyRateLimitHeaders(c, workspaceRateLimit)

        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId, slug: workspace.slug })
          .from(workspace)
          .where(eq(workspace.slug, input.slug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        const folder = resolveWorkspaceUploadFolder(input.folder)
        const uploadPolicy = WORKSPACE_UPLOAD_POLICIES[folder]
        const { safeFileName, normalizedContentType } = validateUploadInput({
          fileName: input.fileName,
          contentType: input.contentType,
          fileSize: input.fileSize,
          policy: uploadPolicy,
        })

        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role, permissions: workspaceMember.permissions })
            .from(workspaceMember)
            .where(
              and(
                eq(workspaceMember.workspaceId, ws.id),
                eq(workspaceMember.userId, ctx.session.user.id),
                eq(workspaceMember.isActive, true)
              )
            )
            .limit(1)
          const perms = (me?.permissions || {}) as Record<string, boolean>
          const isBrandingUpload = folder.startsWith("branding/")
          if (me?.role === "admin" || me?.role === "member" || (isBrandingUpload && perms?.canConfigureBranding === true)) allowed = true
        }
        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const key = `workspaces/${ws.slug}/${folder}/${id}-${safeFileName}`

        const payload = await buildSignedUpload({
          s3,
          bucket,
          publicBase,
          key,
          contentType: normalizedContentType,
          contentLength: input.fileSize,
        })
        return c.json(payload)
      }),

    getPublicPostImageUploadUrl: publicProcedure
      .input(getPostImageUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = await getSessionUserId(c.req.raw.headers)
        const publicPostRateLimit = userId
          ? await limitStoragePublicPostUser(userId)
          : await limitStoragePublicPostAnon(c.req.raw)
        applyRateLimitHeaders(c, publicPostRateLimit)

        const [ws] = await ctx.db
          .select({ id: workspace.id, slug: workspace.slug })
          .from(workspace)
          .where(eq(workspace.slug, input.workspaceSlug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        const [targetBoard] = await ctx.db
          .select({ id: board.id, isPublic: board.isPublic, allowAnonymous: board.allowAnonymous })
          .from(board)
          .where(
            and(
              eq(board.workspaceId, ws.id),
              eq(board.slug, input.boardSlug)
            )
          )
          .limit(1)
        if (!targetBoard) throw new HTTPException(404, { message: "Board not found" })
        if (!targetBoard.isPublic) {
          throw new HTTPException(403, { message: "Private boards require workspace access for uploads" })
        }
        if (!userId && !targetBoard.allowAnonymous) {
          throw new HTTPException(401, { message: "Please sign in to upload images on this board" })
        }

        const { safeFileName, normalizedContentType } = validateUploadInput({
          fileName: input.fileName,
          contentType: input.contentType,
          fileSize: input.fileSize,
          policy: POST_IMAGE_UPLOAD_POLICY,
        })

        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const key = `workspaces/${ws.slug}/posts/${id}-${safeFileName}`

        const payload = await buildSignedUpload({
          s3,
          bucket,
          publicBase,
          key,
          contentType: normalizedContentType,
          contentLength: input.fileSize,
        })
        return c.json(payload)
      }),

    getPostImageUploadUrl: privateProcedure
      .input(getPostImageUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = String(ctx.session.user.id || "")
        const memberPostRateLimit = await limitStorageMemberPost(userId)
        applyRateLimitHeaders(c, memberPostRateLimit)

        const [ws] = await ctx.db
          .select({ id: workspace.id, ownerId: workspace.ownerId, slug: workspace.slug })
          .from(workspace)
          .where(eq(workspace.slug, input.workspaceSlug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        const [targetBoard] = await ctx.db
          .select({ id: board.id })
          .from(board)
          .where(
            and(
              eq(board.workspaceId, ws.id),
              eq(board.slug, input.boardSlug)
            )
          )
          .limit(1)
        if (!targetBoard) throw new HTTPException(404, { message: "Board not found" })

        let allowed = ws.ownerId === ctx.session.user.id
        if (!allowed) {
          const [me] = await ctx.db
            .select({ role: workspaceMember.role })
            .from(workspaceMember)
            .where(
              and(
                eq(workspaceMember.workspaceId, ws.id),
                eq(workspaceMember.userId, ctx.session.user.id),
                eq(workspaceMember.isActive, true)
              )
            )
            .limit(1)
          if (me?.role === "admin" || me?.role === "member" || me?.role === "viewer") {
            allowed = true
          }
        }

        if (!allowed) throw new HTTPException(403, { message: "Forbidden" })

        const { safeFileName, normalizedContentType } = validateUploadInput({
          fileName: input.fileName,
          contentType: input.contentType,
          fileSize: input.fileSize,
          policy: POST_IMAGE_UPLOAD_POLICY,
        })

        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const key = `workspaces/${ws.slug}/posts/${id}-${safeFileName}`

        const payload = await buildSignedUpload({
          s3,
          bucket,
          publicBase,
          key,
          contentType: normalizedContentType,
          contentLength: input.fileSize,
        })
        return c.json(payload)
      }),

    getCommentImageUploadUrl: privateProcedure
      .input(getCommentImageUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = String(ctx.session.user.id || "")
        const commentRateLimit = await limitStorageComment(userId)
        applyRateLimitHeaders(c, commentRateLimit)

        const [targetPost] = await ctx.db
          .select({
            postId: post.id,
            workspaceSlug: workspace.slug,
            workspaceId: workspace.id,
            ownerId: workspace.ownerId,
            boardIsPublic: board.isPublic,
            allowComments: board.allowComments,
            postIsLocked: post.isLocked,
          })
          .from(post)
          .innerJoin(board, eq(post.boardId, board.id))
          .innerJoin(workspace, eq(board.workspaceId, workspace.id))
          .where(eq(post.id, input.postId))
          .limit(1)

        if (!targetPost) {
          throw new HTTPException(404, { message: "Post not found" })
        }

        if (!targetPost.allowComments) {
          throw new HTTPException(403, { message: "Comments are currently disabled on this board" })
        }

        if (targetPost.postIsLocked) {
          throw new HTTPException(403, { message: "This post is locked" })
        }

        let allowed = targetPost.ownerId === ctx.session.user.id
        if (!allowed) {
          allowed = await hasActiveWorkspaceMembership(ctx, targetPost.workspaceId, ctx.session.user.id)
        }

        if (!targetPost.boardIsPublic && !allowed) {
          throw new HTTPException(403, { message: "Only workspace members can upload images for this post" })
        }

        const { safeFileName, normalizedContentType } = validateUploadInput({
          fileName: input.fileName,
          contentType: input.contentType,
          fileSize: input.fileSize,
          policy: COMMENT_IMAGE_UPLOAD_POLICY,
        })

        const { s3, bucket, publicBase } = createStorageContext()
        const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`
        const key = `workspaces/${targetPost.workspaceSlug}/comments/${id}-${safeFileName}`

        const payload = await buildSignedUpload({
          s3,
          bucket,
          publicBase,
          key,
          contentType: normalizedContentType,
          contentLength: input.fileSize,
        })
        return c.json(payload)
      }),
  })
}
