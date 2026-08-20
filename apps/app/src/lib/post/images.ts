export type PostImageAttachment = {
  name: string
  url: string
  type: string
}

export type ListedPostImage = {
  url: string
  name: string
  type: string
}

function attachmentsFromMetadata(metadata: unknown): PostImageAttachment[] {
  if (!metadata || typeof metadata !== "object") {
    return []
  }
  const value = (metadata as { attachments?: unknown }).attachments
  if (!Array.isArray(value)) {
    return []
  }
  return value.flatMap((item) => {
    if (!item || typeof item !== "object") {
      return []
    }
    const url = (item as { url?: unknown }).url
    if (typeof url !== "string" || !url) {
      return []
    }
    const name =
      typeof (item as { name?: unknown }).name === "string"
        ? (item as { name: string }).name
        : "image"
    const type =
      typeof (item as { type?: unknown }).type === "string"
        ? (item as { type: string }).type
        : "image/*"
    return [{ url, name, type }]
  })
}

export function listPostImages(
  image: string | null | undefined,
  metadata?: unknown
): ListedPostImage[] {
  const listed: ListedPostImage[] = []
  const seen = new Set<string>()

  const push = (item: ListedPostImage) => {
    if (seen.has(item.url)) {
      return
    }
    seen.add(item.url)
    listed.push(item)
  }

  if (image) {
    push({ url: image, name: "image", type: "image/*" })
  }

  for (const attachment of attachmentsFromMetadata(metadata)) {
    if (attachment.type && !attachment.type.startsWith("image/")) {
      continue
    }
    push(attachment)
  }

  return listed
}
