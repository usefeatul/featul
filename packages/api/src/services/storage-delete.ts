import { DeleteObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3"
import { or, eq, isNotNull, sql, asc } from "drizzle-orm"
import { comment, post } from "@featul/db"
import { HTTPException } from "hono/http-exception"
import { createStorageContext, type StorageContext } from "./storage-signer"
import { listCommentImageUrls, listPostImageUrls } from "../shared/post-images"
import {
  isDeletableContentKey,
  objectKeyFromPublicUrl,
  publicUrlForKey,
} from "../shared/storage-object"

const attachmentContains = (url: string) =>
  JSON.stringify([{ url }])

function tryCreateStorageContext(): StorageContext | null {
  try {
    return createStorageContext()
  } catch {
    return null
  }
}

export async function isImageUrlReferenced(
  db: any,
  url: string,
): Promise<boolean> {
  const payload = attachmentContains(url)
  const [postHit] = await db
    .select({ id: post.id })
    .from(post)
    .where(
      or(
        eq(post.image, url),
        sql`CAST(${post.metadata} AS jsonb)->'attachments' @> ${payload}::jsonb`,
      ),
    )
    .limit(1)

  if (postHit?.id) return true

  const [commentHit] = await db
    .select({ id: comment.id })
    .from(comment)
    .where(
      sql`CAST(${comment.metadata} AS jsonb)->'attachments' @> ${payload}::jsonb`,
    )
    .limit(1)

  return Boolean(commentHit?.id)
}

export async function deleteUnreferencedImageUrls(
  db: any,
  urls: string[],
): Promise<void> {
  const unique = [...new Set(urls.filter(Boolean))]
  if (unique.length === 0) return

  const storage = tryCreateStorageContext()
  if (!storage) return

  await Promise.all(
    unique.map(async (url) => {
      try {
        const key = objectKeyFromPublicUrl(url, storage.publicBase)
        if (!key || !isDeletableContentKey(key)) return
        if (await isImageUrlReferenced(db, url)) return
        await storage.s3.send(
          new DeleteObjectCommand({
            Bucket: storage.bucket,
            Key: key,
          }),
        )
      } catch (error) {
        console.error("Failed to delete unreferenced image:", url, error)
      }
    }),
  )
}

export async function deleteUploadByPublicUrl({
  db,
  publicUrl,
}: {
  db: any
  publicUrl: string
}): Promise<{ deleted: true }> {
  const storage = tryCreateStorageContext()
  if (!storage) {
    throw new HTTPException(500, { message: "Image storage is not configured" })
  }

  const key = objectKeyFromPublicUrl(publicUrl, storage.publicBase)
  if (!key || !isDeletableContentKey(key)) {
    throw new HTTPException(400, { message: "Invalid image URL" })
  }

  if (await isImageUrlReferenced(db, publicUrlForKey(storage.publicBase, key))) {
    throw new HTTPException(409, {
      message: "Image is still attached to a post or comment",
    })
  }

  await storage.s3.send(
    new DeleteObjectCommand({
      Bucket: storage.bucket,
      Key: key,
    }),
  )

  return { deleted: true }
}

const DEFAULT_ORPHAN_MAX_AGE_DAYS = 7
const DEFAULT_ORPHAN_MAX_DELETES = 200
const LIST_PAGE_SIZE = 1000
const MAX_LIST_PAGES = 20

export type StorageOrphanGcResult = {
  skipped?: boolean
  scanned: number
  deleted: number
  referenced: number
  tooNew: number
}

async function collectReferencedImageUrls(db: any): Promise<Set<string>> {
  const urls = new Set<string>()
  const pageSize = 500
  let offset = 0

  while (true) {
    const posts = await db
      .select({ image: post.image, metadata: post.metadata })
      .from(post)
      .where(or(isNotNull(post.image), isNotNull(post.metadata)))
      .orderBy(asc(post.id))
      .limit(pageSize)
      .offset(offset)

    if (!posts.length) break
    for (const row of posts) {
      for (const url of listPostImageUrls(row.image, row.metadata)) {
        urls.add(url)
      }
    }
    offset += posts.length
    if (posts.length < pageSize) break
  }

  offset = 0
  while (true) {
    const comments = await db
      .select({ metadata: comment.metadata })
      .from(comment)
      .where(isNotNull(comment.metadata))
      .orderBy(asc(comment.id))
      .limit(pageSize)
      .offset(offset)

    if (!comments.length) break
    for (const row of comments) {
      for (const url of listCommentImageUrls(row.metadata)) {
        urls.add(url)
      }
    }
    offset += comments.length
    if (comments.length < pageSize) break
  }

  return urls
}

export async function runStorageOrphanGc(
  db: any,
  options?: { maxAgeDays?: number; maxDeletes?: number },
): Promise<StorageOrphanGcResult> {
  const storage = tryCreateStorageContext()
  if (!storage) {
    return { skipped: true, scanned: 0, deleted: 0, referenced: 0, tooNew: 0 }
  }

  const maxAgeDays = Math.max(
    1,
    options?.maxAgeDays ??
      Number(process.env.STORAGE_ORPHAN_GC_MAX_AGE_DAYS || DEFAULT_ORPHAN_MAX_AGE_DAYS),
  )
  const maxDeletes = Math.max(
    1,
    options?.maxDeletes ??
      Number(process.env.STORAGE_ORPHAN_GC_MAX_DELETES || DEFAULT_ORPHAN_MAX_DELETES),
  )
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000
  const referenced = await collectReferencedImageUrls(db)

  let continuationToken: string | undefined
  let scanned = 0
  let deleted = 0
  let referencedCount = 0
  let tooNew = 0
  let pages = 0

  do {
    const listed = await storage.s3.send(
      new ListObjectsV2Command({
        Bucket: storage.bucket,
        Prefix: "workspaces/",
        MaxKeys: LIST_PAGE_SIZE,
        ContinuationToken: continuationToken,
      }),
    )

    pages += 1
    const contents = listed.Contents || []
    for (const object of contents) {
      const key = object.Key
      if (!key || !isDeletableContentKey(key)) continue
      scanned += 1
      const lastModified = object.LastModified?.getTime() || 0
      if (lastModified > cutoff) {
        tooNew += 1
        continue
      }
      const url = publicUrlForKey(storage.publicBase, key)
      if (referenced.has(url)) {
        referencedCount += 1
        continue
      }
      await storage.s3.send(
        new DeleteObjectCommand({
          Bucket: storage.bucket,
          Key: key,
        }),
      )
      deleted += 1
      if (deleted >= maxDeletes) {
        return { scanned, deleted, referenced: referencedCount, tooNew }
      }
    }

    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined
  } while (continuationToken && pages < MAX_LIST_PAGES)

  return { scanned, deleted, referenced: referencedCount, tooNew }
}
