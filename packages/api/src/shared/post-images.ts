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
