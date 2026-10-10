/** Run with a backed-up DB and writes paused. Default: inventory only.
 * bun --env-file=apps/app/.env.local packages/api/scripts/attachments.ts
 * Add --copy-and-rewrite, then --delete-public only after verifying delivery.
 */
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { db, post, comment } from "@featul/db";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import { createStorageContext } from "../src/storage/signer";
import {
  isDeletableContentKey,
  objectKeyFromPublicUrl,
  publicUrlForKey,
} from "../src/storage/object";
import { protectedImageKey, protectedImageUrl } from "../src/storage/protected";
import { isImageUrlReferenced } from "../src/storage/delete";

const copyOnly = process.argv.includes("--copy-only");
const copy = copyOnly || process.argv.includes("--copy-and-rewrite");
const remove = process.argv.includes("--delete-public");
if (copy && remove)
  throw new Error("Run copying and public deletion as separate phases");
const { s3, bucket, publicBase } = createStorageContext();
const privateBucket = process.env.R2_PRIVATE_BUCKET;
if (!privateBucket || privateBucket === bucket)
  throw new Error(
    "Configure a separate R2_PRIVATE_BUCKET with public access disabled",
  );
const keys: string[] = [];
let token: string | undefined;
do {
  const page = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucket,
      Prefix: "workspaces/",
      ContinuationToken: token,
    }),
  );
  for (const object of page.Contents || [])
    if (object.Key && isDeletableContentKey(object.Key)) keys.push(object.Key);
  token = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (token);
console.log(
  `Public content objects: ${keys.length}. Mode: ${copyOnly ? "copy only" : copy ? "copy and rewrite" : remove ? "delete verified public copies" : "read-only inventory"}`,
);
if (copy) {
  for (const key of keys) {
    const source = await s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key }));
    await s3.send(
      new CopyObjectCommand({
        Bucket: privateBucket,
        Key: key,
        CopySource: `${bucket}/${key.split("/").map(encodeURIComponent).join("/")}`,
        MetadataDirective: "REPLACE",
        ContentType: source.ContentType,
        Metadata: source.Metadata,
        CacheControl: "private, no-store",
      }),
    );
    const target = await s3.send(new HeadObjectCommand({ Bucket: privateBucket, Key: key }));
    if (
      source.ETag !== target.ETag ||
      source.ContentLength !== target.ContentLength
    )
      throw new Error("Copy verification failed; originals retained");
  }
  console.log(`Verified ${keys.length} private copies.`);
}
if (copy && !copyOnly) {
  const copied = new Set(keys);
  const rewrite = (url: string): string => {
    if (protectedImageKey(url)) return url;
    const key = objectKeyFromPublicUrl(url, publicBase);
    if (!key || !isDeletableContentKey(key)) return url;
    if (!copied.has(key))
      throw new Error(
        "A referenced public object is missing; originals retained",
      );
    return protectedImageUrl(key);
  };
  // Reads and updates are deliberately resumable. Pause application writes for this phase.
  for (const row of await db.select().from(post)) {
    const image = row.image ? rewrite(row.image) : row.image;
    const metadata = row.metadata?.attachments
      ? {
          ...row.metadata,
          attachments: row.metadata.attachments.map((a) => ({
            ...a,
            url: rewrite(a.url),
          })),
        }
      : row.metadata;
    if (
      image !== row.image ||
      JSON.stringify(metadata) !== JSON.stringify(row.metadata)
    )
      await db.update(post).set({ image, metadata }).where(eq(post.id, row.id));
  }
  for (const row of await db.select().from(comment)) {
    const metadata = row.metadata?.attachments
      ? {
          ...row.metadata,
          attachments: row.metadata.attachments.map((a) => ({
            ...a,
            url: rewrite(a.url),
          })),
        }
      : row.metadata;
    if (JSON.stringify(metadata) !== JSON.stringify(row.metadata))
      await db.update(comment).set({ metadata }).where(eq(comment.id, row.id));
  }
  console.log(
    "Copies verified and references rewritten. Public originals retained until the deletion phase.",
  );
}
if (remove) {
  // The legacy bucket may be shared by production, previews, and development.
  // Require an explicit inventory of every reference database before deletion.
  const databaseUrls: unknown = JSON.parse(process.env.ATTACHMENT_REFERENCE_DATABASE_URLS || "null");
  if (!Array.isArray(databaseUrls) || !databaseUrls.length || !databaseUrls.every(url => typeof url === "string" && /^postgres(?:ql)?:/.test(url)) || !databaseUrls.includes(process.env.DATABASE_URL)) {
    throw new Error("Set ATTACHMENT_REFERENCE_DATABASE_URLS to every database sharing the legacy bucket, including DATABASE_URL");
  }
  const referenceDatabases = databaseUrls.map(url => drizzle(neon(url)));
  // Validate the entire batch before deleting any object.
  for (const key of keys) {
    for (const database of referenceDatabases) {
      if (await isImageUrlReferenced(database, publicUrlForKey(publicBase, key)))
        throw new Error("Legacy references remain in a configured database; aborting public deletion");
    }
    const [source, target] = await Promise.all([
      s3.send(new HeadObjectCommand({ Bucket: bucket, Key: key })),
      s3.send(new HeadObjectCommand({ Bucket: privateBucket, Key: key })),
    ]);
    if (
      source.ETag !== target.ETag ||
      source.ContentLength !== target.ContentLength
    )
      throw new Error(
        "Private copy is missing or differs; aborting public deletion",
      );
  }
  for (const key of keys)
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  console.log(
    "Verified public originals deleted. Purge the upload CDN cache before resuming writes.",
  );
}
