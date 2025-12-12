import { client } from "@oreilla/api/client"

export async function getCommentImageUploadUrl(
  postId: string,
  fileName: string,
  contentType: string
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const res = await client.storage.getCommentImageUploadUrl.$post({
    postId,
    fileName,
    contentType,
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

