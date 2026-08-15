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
import { uploadImageSchema } from "./schema";

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
