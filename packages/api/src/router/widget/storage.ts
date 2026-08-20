import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { board } from "@featul/db";
import { publicProcedure } from "../../jstack";
import {
  createStorageContext,
  buildSignedUpload,
} from "../../services/storage-signer";
import {
  POST_IMAGE_UPLOAD_POLICY,
  validateUploadInput,
} from "../../shared/storage-upload";
import {
  applyRateLimitHeaders,
  limitStoragePublicPostAnon,
  limitStoragePublicPostUser,
} from "../../services/ratelimiter";
import { getWidgetRequest, resolveAuthorId, resolveWidget } from "./resolve";
import { deleteImageSchema, uploadImageSchema } from "./schema";
import { deleteUploadByPublicUrl } from "../../services/storage-delete";
import {
  isDeletableContentKey,
  objectKeyFromPublicUrl,
  workspaceSlugFromContentKey,
} from "../../shared/storage-object";

export const widgetUploadImage = publicProcedure
  .input(uploadImageSchema)
  .post(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(
      ctx,
      input.projectId,
      input.parentOrigin,
    );

    const [targetBoard] = await ctx.db
      .select({
        id: board.id,
        allowAnonymous: board.allowAnonymous,
      })
      .from(board)
      .where(
        and(
          eq(board.id, input.boardId),
          eq(board.workspaceId, resolved.workspaceId),
          eq(board.isSystem, false),
          eq(board.isPublic, true),
        ),
      )
      .limit(1);

    if (!targetBoard)
      throw new HTTPException(404, { message: "Board not found" });

    const uploaderId = await resolveAuthorId(
      ctx,
      input,
      resolved.workspaceId,
      resolved.widgetSecret,
    );

    if (
      !uploaderId &&
      (!resolved.config.allowGuestPosting || !targetBoard.allowAnonymous)
    ) {
      throw new HTTPException(401, {
        message: "Please identify before uploading an image",
      });
    }

    const request = getWidgetRequest(c);
    const rateLimit = uploaderId
      ? await limitStoragePublicPostUser(uploaderId)
      : await limitStoragePublicPostAnon(request);
    applyRateLimitHeaders(
      c,
      rateLimit,
      "Too many upload URL requests. Please try again shortly.",
    );

    const { safeFileName, normalizedContentType } = validateUploadInput({
      fileName: input.fileName,
      contentType: input.contentType,
      fileSize: input.fileSize,
      policy: POST_IMAGE_UPLOAD_POLICY,
    });

    const { s3, bucket, publicBase } = createStorageContext();
    const id = globalThis.crypto?.randomUUID?.() || `${Date.now()}`;
    const key = `workspaces/${resolved.workspaceSlug}/posts/${id}-${safeFileName}`;

    const payload = await buildSignedUpload({
      s3,
      bucket,
      publicBase,
      key,
      contentType: normalizedContentType,
      contentLength: input.fileSize,
    });

    return c.json(payload);
  });

export const widgetDeleteImage = publicProcedure
  .input(deleteImageSchema)
  .post(async ({ ctx, input, c }) => {
    const resolved = await resolveWidget(
      ctx,
      input.projectId,
      input.parentOrigin,
    );

    const uploaderId = await resolveAuthorId(
      ctx,
      input,
      resolved.workspaceId,
      resolved.widgetSecret,
    );

    const request = getWidgetRequest(c);
    const rateLimit = uploaderId
      ? await limitStoragePublicPostUser(uploaderId)
      : await limitStoragePublicPostAnon(request);
    applyRateLimitHeaders(
      c,
      rateLimit,
      "Too many delete requests. Please try again shortly.",
    );

    const publicBase = String(process.env.R2_PUBLIC_BASE_URL || "");
    const key = objectKeyFromPublicUrl(input.url, publicBase);
    if (
      !key ||
      !isDeletableContentKey(key) ||
      workspaceSlugFromContentKey(key) !== resolved.workspaceSlug
    ) {
      throw new HTTPException(400, { message: "Invalid image URL" });
    }

    const payload = await deleteUploadByPublicUrl({
      db: ctx.db,
      publicUrl: input.url,
    });
    return c.json(payload);
  });
