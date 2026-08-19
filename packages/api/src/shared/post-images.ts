import { POST_MAX_IMAGES } from "../upload-policy"

export type PostImageInput = {
  url: string
  name?: string
  type?: string
}

export type PostAttachment = {
  name: string
  url: string
  type: string
}

export function resolvePostImageFields(input: {
  image?: string | null
  images?: PostImageInput[]
}): { image: string | null; attachments: PostAttachment[] } | undefined {
  if (input.images === undefined) {
    if (input.image === undefined) {
      return undefined
    }
    return {
      image: input.image,
      attachments: [],
    }
  }

  const unique: PostImageInput[] = []
  const seen = new Set<string>()
  for (const item of input.images) {
    if (!item?.url || seen.has(item.url)) {
      continue
    }
    seen.add(item.url)
    unique.push(item)
    if (unique.length >= POST_MAX_IMAGES) {
      break
    }
  }

  const [cover, ...rest] = unique
  return {
    image: cover?.url ?? null,
    attachments: rest.map((item, index) => ({
      url: item.url,
      name: item.name?.trim() || `image-${index + 2}`,
      type: item.type?.trim() || "image/*",
    })),
  }
}

export function mergePostMetadata(
  existing: Record<string, unknown> | null | undefined,
  attachments: PostAttachment[]
): Record<string, unknown> | undefined {
  const rest = { ...(existing || {}) }
  delete rest.attachments
  if (attachments.length > 0) {
    rest.attachments = attachments
  }
  return Object.keys(rest).length > 0 ? rest : undefined
}

export function listPostImageUrls(
  image: string | null | undefined,
  metadata?: unknown
): string[] {
  const urls: string[] = []
  const seen = new Set<string>()
  const push = (url: string) => {
    if (!url || seen.has(url)) {
      return
    }
    seen.add(url)
    urls.push(url)
  }

  if (image) {
    push(image)
  }

  if (!metadata || typeof metadata !== "object") {
    return urls
  }

  const attachments = (metadata as { attachments?: unknown }).attachments
  if (!Array.isArray(attachments)) {
    return urls
  }

  for (const item of attachments) {
    if (!item || typeof item !== "object") {
      continue
    }
    const url = (item as { url?: unknown }).url
    const type = (item as { type?: unknown }).type
    if (typeof url !== "string" || !url) {
      continue
    }
    if (
      typeof type === "string" &&
      type.length > 0 &&
      !type.startsWith("image")
    ) {
      continue
    }
    push(url)
  }

  return urls
}
