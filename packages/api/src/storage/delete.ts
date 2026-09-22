import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import { and, or, eq, gt, isNotNull, sql, asc } from "drizzle-orm"
import { comment, post } from "@featul/db"
import { HTTPException } from "hono/http-exception"
import { createStorageContext, type StorageContext } from "./signer"
import { listCommentImageUrls, listPostImageUrls } from "./images"
import {
  isDeletableContentKey,
  objectKeyFromPublicUrl,
  publicUrlForKey,
} from "./object"

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
const GC_CURSOR_KEY = "system/storage-orphan-gc-cursor.txt"

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
  let lastPostId: string | undefined

  while (true) {
    const posts = await db
      .select({ id: post.id, image: post.image, metadata: post.metadata })
      .from(post)
      .where(
        lastPostId
          ? and(
              or(isNotNull(post.image), isNotNull(post.metadata)),
              gt(post.id, lastPostId),
            )
          : or(isNotNull(post.image), isNotNull(post.metadata)),
      )
      .orderBy(asc(post.id))
      .limit(pageSize)

    if (!posts.length) break
    for (const row of posts) {
      for (const url of listPostImageUrls(row.image, row.metadata)) {
        urls.add(url)
      }
    }
    lastPostId = posts[posts.length - 1]?.id
    if (posts.length < pageSize) break
  }

  let lastCommentId: string | undefined
  while (true) {
    const comments = await db
      .select({ id: comment.id, metadata: comment.metadata })
      .from(comment)
      .where(
        lastCommentId
          ? and(isNotNull(comment.metadata), gt(comment.id, lastCommentId))
          : isNotNull(comment.metadata),
      )
      .orderBy(asc(comment.id))
      .limit(pageSize)

    if (!comments.length) break
    for (const row of comments) {
      for (const url of listCommentImageUrls(row.metadata)) {
        urls.add(url)
      }
    }
    lastCommentId = comments[comments.length - 1]?.id
    if (comments.length < pageSize) break
  }

  return urls
}

function positiveNumberOrDefault(value: unknown, fallback: number): number {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

async function readGcCursor(storage: StorageContext): Promise<string | undefined> {
  try {
    const response = await storage.s3.send(
      new GetObjectCommand({ Bucket: storage.bucket, Key: GC_CURSOR_KEY }),
    )
    const value = (await response.Body?.transformToString())?.trim()
    return value || undefined
  } catch {
    return undefined
  }
}

async function saveGcCursor(
  storage: StorageContext,
  key: string | undefined,
): Promise<void> {
  if (!key) return
  await storage.s3.send(
    new PutObjectCommand({
      Bucket: storage.bucket,
      Key: GC_CURSOR_KEY,
      Body: key,
      ContentType: "text/plain",
    }),
  )
}

async function clearGcCursor(storage: StorageContext): Promise<void> {
  await storage.s3.send(
    new DeleteObjectCommand({ Bucket: storage.bucket, Key: GC_CURSOR_KEY }),
  )
}

export async function runStorageOrphanGc(
  db: any,
  options?: { maxAgeDays?: number; maxDeletes?: number },
): Promise<StorageOrphanGcResult> {
  const storage = tryCreateStorageContext()
  if (!storage) {
    return { skipped: true, scanned: 0, deleted: 0, referenced: 0, tooNew: 0 }
  }

  const maxAgeDays = positiveNumberOrDefault(
    options?.maxAgeDays ?? process.env.STORAGE_ORPHAN_GC_MAX_AGE_DAYS,
    DEFAULT_ORPHAN_MAX_AGE_DAYS,
  )
  const maxDeletes = Math.max(
    1,
    Math.floor(
      positiveNumberOrDefault(
        options?.maxDeletes ?? process.env.STORAGE_ORPHAN_GC_MAX_DELETES,
        DEFAULT_ORPHAN_MAX_DELETES,
      ),
    ),
  )
  const cutoff = Date.now() - maxAgeDays * 24 * 60 * 60 * 1000
  const referenced = await collectReferencedImageUrls(db)

  let continuationToken: string | undefined
  let scanned = 0
  let deleted = 0
  let referencedCount = 0
  let tooNew = 0
  let pages = 0
  const startAfter = await readGcCursor(storage)
  let lastVisitedKey = startAfter

  do {
    const listed = await storage.s3.send(
      new ListObjectsV2Command({
        Bucket: storage.bucket,
        Prefix: "workspaces/",
        MaxKeys: LIST_PAGE_SIZE,
        ContinuationToken: continuationToken,
        StartAfter: continuationToken ? undefined : startAfter,
      }),
    )

    pages += 1
    const contents = listed.Contents || []
    for (const object of contents) {
      const key = object.Key
      if (!key) continue
      lastVisitedKey = key
      if (!isDeletableContentKey(key)) continue
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
        await saveGcCursor(storage, lastVisitedKey)
        return { scanned, deleted, referenced: referencedCount, tooNew }
      }
    }

    continuationToken = listed.IsTruncated
      ? listed.NextContinuationToken
      : undefined
  } while (continuationToken && pages < MAX_LIST_PAGES)

  if (continuationToken) {
    await saveGcCursor(storage, lastVisitedKey)
  } else {
    await clearGcCursor(storage)
  }

  return { scanned, deleted, referenced: referencedCount, tooNew }
}
