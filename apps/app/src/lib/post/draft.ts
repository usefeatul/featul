export type CreatePostDraft = {
  title: string
  content: string
  images: Array<{ url: string; name: string; type: string }>
}

export function createPostDraftKey(workspaceSlug: string) {
  return `featul:create-post-draft:${workspaceSlug}`
}

/** Reads a create-post draft from localStorage; null on the server. */
export function readCreatePostDraft(
  workspaceSlug: string
): CreatePostDraft | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    const raw = window.localStorage.getItem(createPostDraftKey(workspaceSlug))
    if (!raw) {
      return null
    }
    const parsed = JSON.parse(raw) as Partial<CreatePostDraft>
    const title = typeof parsed.title === "string" ? parsed.title : ""
    const content = typeof parsed.content === "string" ? parsed.content : ""
    const images = Array.isArray(parsed.images)
      ? parsed.images.flatMap((item) => {
          if (!item || typeof item !== "object" || typeof item.url !== "string") {
            return []
          }
          return [
            {
              url: item.url,
              name: typeof item.name === "string" ? item.name : "image",
              type: typeof item.type === "string" ? item.type : "image/*",
            },
          ]
        })
      : []

    if (!title.trim() && !content.trim() && images.length === 0) {
      return null
    }

    return { title, content, images }
  } catch {
    return null
  }
}

/** Writes the draft, or clears storage when the form is empty. */
export function writeCreatePostDraft(
  workspaceSlug: string,
  draft: CreatePostDraft
) {
  if (typeof window === "undefined") {
    return
  }

  if (!draft.title.trim() && !draft.content.trim() && draft.images.length === 0) {
    clearCreatePostDraft(workspaceSlug)
    return
  }

  window.localStorage.setItem(
    createPostDraftKey(workspaceSlug),
    JSON.stringify(draft)
  )
}

/** Removes the create-post draft for this workspace. */
export function clearCreatePostDraft(workspaceSlug: string) {
  if (typeof window === "undefined") {
    return
  }
  window.localStorage.removeItem(createPostDraftKey(workspaceSlug))
}
