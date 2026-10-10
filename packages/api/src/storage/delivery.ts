import { GetObjectCommand } from "@aws-sdk/client-s3";
import { eq, or, sql } from "drizzle-orm";
import { db, post, comment } from "@featul/db";
import { HTTPException } from "hono/http-exception";
import { requireCommentAccess, requirePostAccess } from "../post/access";
import { createStorageContext } from "./signer";
import { isDeletableContentKey } from "./object";
import { protectedImageUrl } from "./protected";

async function references(database: typeof db, url: string) {
  const payload = JSON.stringify([{ url }]);
  return Promise.all([
    database
      .select({ id: post.id })
      .from(post)
      .where(
        or(
          eq(post.image, url),
          sql`CAST(${post.metadata} AS jsonb)->'attachments' @> ${payload}::jsonb`,
        ),
      )
      .limit(100),
    database
      .select({ id: comment.id })
      .from(comment)
      .where(
        sql`CAST(${comment.metadata} AS jsonb)->'attachments' @> ${payload}::jsonb`,
      )
      .limit(100),
  ]);
}

/** Prevent a caller from republishing an existing private image by copying its URL. */
export async function requireImageReferenceAccess(
  database: typeof db,
  urls: string[],
  userId: string | null,
) {
  for (const url of new Set(urls)) {
    const [posts, comments] = await references(database, url);
    for (const p of posts)
      await requirePostAccess(database, p.id, userId, {
        allowUnpublishedForMembers: true,
      });
    for (const c of comments)
      await requireCommentAccess(database, c.id, userId, {
        allowUnpublishedForMembers: true,
      });
  }
}

export async function deliverImage(
  request: Request,
  userId: string | null,
): Promise<Response> {
  const key = new URL(request.url).searchParams.get("key") || "";
  if (!isDeletableContentKey(key) || /[\\\x00-\x1f]/.test(key))
    return new Response(null, { status: 404 });
  const url = protectedImageUrl(key);
  const [posts, comments] = await references(db, url);
  let allowed = false;
  // Resolve visibility at read time so membership revocation and internal/private
  // transitions take effect immediately. Never redirect to a permanent bucket URL.
  for (const item of [
    ...posts.map((p) => ({ ...p, kind: "post" })),
    ...comments.map((c) => ({ ...c, kind: "comment" })),
  ]) {
    try {
      if (item.kind === "post")
        await requirePostAccess(db, item.id, userId, {
          allowUnpublishedForMembers: true,
        });
      else
        await requireCommentAccess(db, item.id, userId, {
          allowUnpublishedForMembers: true,
        });
      allowed = true;
      break;
    } catch (error) {
      if (!(error instanceof HTTPException) || error.status !== 404)
        throw error;
    }
  }
  if (!allowed)
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "private, no-store" },
    });
  const bucket = process.env.R2_PRIVATE_BUCKET;
  if (!bucket || bucket === process.env.R2_BUCKET)
    return new Response(null, { status: 503, headers: { "Cache-Control": "no-store" } });
  try {
    const { s3 } = createStorageContext();
    const object = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
      {
        abortSignal: AbortSignal.any([
          request.signal,
          AbortSignal.timeout(10_000),
        ]),
      },
    );
    if (
      !object.Body ||
      !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
        object.ContentType || "",
      )
    )
      return new Response(null, { status: 404 });
    return new Response(object.Body.transformToWebStream() as ReadableStream, {
      headers: {
        "Content-Type": object.ContentType!,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
        Vary: "Cookie, Origin",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch {
    return new Response(null, {
      status: 404,
      headers: { "Cache-Control": "no-store" },
    });
  }
}
