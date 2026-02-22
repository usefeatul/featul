import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { SIGNED_UPLOAD_URL_TTL_SECONDS } from "../shared/storage-upload"

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
