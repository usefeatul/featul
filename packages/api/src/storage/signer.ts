import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { isDeletableContentKey } from "./object"
import { protectedImageUrl } from "./protected"
import { SIGNED_UPLOAD_URL_TTL_SECONDS } from "./upload"

function getEnv(name: string): string {
  const v = process.env[name]
  if (!v) throw new Error(`Missing env: ${name}`)
  return v
}

export interface StorageContext {
  s3: S3Client
  bucket: string
  publicBase: string
}

export function createStorageContext(): StorageContext {
  const accessKeyId = getEnv("R2_ACCESS_KEY_ID")
  const secretAccessKey = getEnv("R2_SECRET_ACCESS_KEY")
  const bucket = getEnv("R2_BUCKET")
  const publicBase = getEnv("R2_PUBLIC_BASE_URL")

  // Any S3-compatible store (MinIO, Backblaze B2, …) via R2_ENDPOINT; Cloudflare R2 otherwise.
  const endpoint = process.env.R2_ENDPOINT?.trim() || `https://${getEnv("R2_ACCOUNT_ID")}.r2.cloudflarestorage.com`
  const s3 = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
    forcePathStyle: true,
  })

  return { s3, bucket, publicBase }
}

export async function buildSignedUpload({
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
  const protectedContent = isDeletableContentKey(key)
  if (protectedContent) {
    const privateBucket = getEnv("R2_PRIVATE_BUCKET")
    if (privateBucket === bucket) throw new Error("Content storage must use a separate private bucket")
    bucket = privateBucket
  }
  const cmd = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
    CacheControl: protectedContent ? "private, no-store" : undefined,
  })
  const uploadUrl = await getSignedUrl(s3, cmd, { expiresIn: SIGNED_UPLOAD_URL_TTL_SECONDS })
  const publicUrl = protectedContent ? protectedImageUrl(key) : `${publicBase}/${key}`
  const previewUrl = protectedContent ? await getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 120 }) : publicUrl
  return { uploadUrl, key, publicUrl, previewUrl }
}
