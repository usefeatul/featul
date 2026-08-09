import { client } from "@featul/api/client"

export async function getCommentImageUploadUrl(
  postId: string,
  fileName: string,
  contentType: string,
  fileSize: number
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const res = await client.storage.getCommentImageUploadUrl.$post({
    postId,
    fileName,
    contentType,
    fileSize,
  })
  if (!res.ok) {
    throw new Error("Failed to get upload URL")
  }
  const data = await res.json()
  return {
    uploadUrl: data.uploadUrl,
    key: data.key,
    publicUrl: data.publicUrl,
  }
}
