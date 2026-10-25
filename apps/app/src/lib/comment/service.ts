import { client } from "@featul/api/client"

/** Requests a signed URL for a comment image. */
export async function getCommentImageUploadUrl(
  postId: string,
  fileName: string,
  contentType: string,
  fileSize: number
): Promise<{ uploadUrl: string; key: string; publicUrl: string; previewUrl?: string }> {
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
    previewUrl: data.previewUrl,
  }
}

/** Deletes an uploaded comment image; 409 means already gone. */
export async function deleteCommentImageUpload(url: string): Promise<void> {
  const res = await client.storage.deleteUpload.$post({ url })
  if (res.ok || res.status === 409) return
  throw new Error("Failed to delete image")
}

/** Transcribes a voice-typing recording (base64 WAV) for the comment box. */
export async function transcribeCommentAudio(postId: string, audio: string): Promise<string> {
  const res = await client.comment.transcribe.$post({ postId, audio, format: "wav" })
  if (!res.ok) {
    throw new Error("Failed to transcribe audio")
  }
  const data = await res.json()
  return data.text
}
