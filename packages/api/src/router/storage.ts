import { j, privateProcedure, publicProcedure } from "../jstack"
import { getUploadUrlInputSchema, getCommentImageUploadUrlInputSchema, getPostImageUploadUrlInputSchema, getAvatarUploadUrlInputSchema } from "../validators/storage"
import { HTTPException } from "hono/http-exception"
import { and, eq } from "drizzle-orm"
import { workspace, post, board } from "@featul/db"
import {
  limitStorageAvatar,
  limitStorageWorkspace,
  limitStoragePublicPostAnon,
  limitStoragePublicPostUser,
  limitStorageComment,
  applyRateLimitHeaders,
} from "../services/ratelimiter"
import { createStorageContext, buildSignedUpload } from "../services/storage-signer"
import {
  AVATAR_UPLOAD_POLICY,
  POST_IMAGE_UPLOAD_POLICY,
  COMMENT_IMAGE_UPLOAD_POLICY,
  WORKSPACE_UPLOAD_POLICIES,
  resolveWorkspaceUploadFolder,
  validateUploadInput,
} from "../shared/storage-upload"
import { getSessionUserId, hasWorkspaceContentAccess, canUploadWorkspaceAsset } from "../shared/storage-access"

export function createStorageRouter() {
  return j.router({
    getAvatarUploadUrl: privateProcedure
      .input(getAvatarUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = String(ctx.session.user.id || "")
        if (!userId) throw new HTTPException(401, { message: "Unauthorized" })

        const avatarRateLimit = await limitStorageAvatar(userId)
        applyRateLimitHeaders(c, avatarRateLimit, "Too many upload URL requests. Please try again shortly.")

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
        applyRateLimitHeaders(c, workspaceRateLimit, "Too many upload URL requests. Please try again shortly.")

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

        const allowed = await canUploadWorkspaceAsset({
          ctx,
          workspaceId: ws.id,
          workspaceOwnerId: ws.ownerId,
          userId: ctx.session.user.id,
          folder,
        })
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
        applyRateLimitHeaders(c, publicPostRateLimit, "Too many upload URL requests. Please try again shortly.")

        const [ws] = await ctx.db
          .select({ id: workspace.id, slug: workspace.slug })
          .from(workspace)
          .where(eq(workspace.slug, input.workspaceSlug))
          .limit(1)
        if (!ws) throw new HTTPException(404, { message: "Workspace not found" })

        const [targetBoard] = await ctx.db
          .select({ id: board.id, isPublic: board.isPublic, allowAnonymous: board.allowAnonymous })
          .from(board)
          .where(and(eq(board.workspaceId, ws.id), eq(board.slug, input.boardSlug)))
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

    getCommentImageUploadUrl: privateProcedure
      .input(getCommentImageUploadUrlInputSchema)
      .post(async ({ ctx, input, c }) => {
        const userId = String(ctx.session.user.id || "")
        const commentRateLimit = await limitStorageComment(userId)
        applyRateLimitHeaders(c, commentRateLimit, "Too many upload URL requests. Please try again shortly.")

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

        const canAccessWorkspace = await hasWorkspaceContentAccess({
          ctx,
          workspaceId: targetPost.workspaceId,
          workspaceOwnerId: targetPost.ownerId,
          userId: ctx.session.user.id,
        })
        if (!targetPost.boardIsPublic && !canAccessWorkspace) {
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
