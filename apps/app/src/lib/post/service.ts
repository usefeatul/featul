import { client } from "@featul/api/client"

type UploadUrlResponse = {
  uploadUrl?: string
  key?: string
  publicUrl?: string
  message?: string
}

export async function getPostImageUploadUrl(
  workspaceSlug: string,
  fileName: string,
  contentType: string,
  fileSize: number,
  boardSlug: string
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const res = await client.storage.getPublicPostImageUploadUrl.$post({
    workspaceSlug,
    fileName,
    contentType,
    fileSize,
    boardSlug
  })
  if (!res.ok) {
    const error = (await res.json().catch(() => null)) as UploadUrlResponse | null
    throw new Error(error?.message || "Failed to get upload URL")
  }
  const data = (await res.json().catch(() => null)) as UploadUrlResponse | null
  if (!data?.uploadUrl || !data?.key || !data?.publicUrl) {
    throw new Error("Upload URL response was incomplete")
  }
  return {
    uploadUrl: data.uploadUrl,
    key: data.key,
    publicUrl: data.publicUrl,
  }
}
