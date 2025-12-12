import { client } from "@oreilla/api/client"

export async function getPostImageUploadUrl(
  workspaceSlug: string,
  fileName: string,
  contentType: string,
  boardSlug?: string
): Promise<{ uploadUrl: string; key: string; publicUrl: string }> {
  const res = await client.storage.getPublicPostImageUploadUrl.$post({
    workspaceSlug,
    fileName,
    contentType,
    boardSlug
  })
  if (!res.ok) {
    const error = await res.json()
    throw new Error((error as any).message || "Failed to get upload URL")
  }
  const data = await res.json()
  return {
    uploadUrl: data.uploadUrl,
    key: data.key,
    publicUrl: data.publicUrl,
  }
}
