import { HTTPException } from "hono/http-exception"

export const WORKSPACE_POST_FOLDERS = ["posts"] as const
export const WORKSPACE_COMMENT_FOLDERS = ["comments"] as const
export const WORKSPACE_BRANDING_FOLDERS = ["branding/logo"] as const
export const WORKSPACE_CHANGELOG_FOLDERS = ["changelog/content", "changelog/covers"] as const

function publicBaseUrl(): string {
  return String(process.env.R2_PUBLIC_BASE_URL || "").replace(/\/+$/, "")
}

/** NEXT-FILES-001: only http(s) objects under this workspace's R2 prefix. */
export function assertWorkspaceAssetUrl(
  imageUrl: string,
  workspaceSlug: string,
  folders: readonly string[],
): void {
  let parsed: URL
  try {
    parsed = new URL(imageUrl)
  } catch {
    throw new HTTPException(400, { message: "Invalid image URL" })
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new HTTPException(400, { message: "Invalid image URL" })
  }

  const publicBase = publicBaseUrl()
  if (!publicBase) {
    throw new HTTPException(500, { message: "Image storage is not configured" })
  }

  const slug = workspaceSlug.trim()
  if (!slug || slug.includes("/") || slug.includes(".")) {
    throw new HTTPException(400, { message: "Invalid image URL" })
  }

  const allowed = folders.some((folder) =>
    imageUrl.startsWith(`${publicBase}/workspaces/${slug}/${folder}/`),
  )
  if (!allowed) {
    throw new HTTPException(400, { message: "Invalid image URL" })
  }
}

export function assertOptionalWorkspaceAssetUrl(
  imageUrl: string | null | undefined,
  workspaceSlug: string,
  folders: readonly string[],
): void {
  if (!imageUrl) return
  assertWorkspaceAssetUrl(imageUrl, workspaceSlug, folders)
}

export function assertPostImageFields(
  fields:
    | { image: string | null; attachments: { url: string }[] }
    | undefined,
  workspaceSlug: string,
): void {
  if (!fields) return
  assertOptionalWorkspaceAssetUrl(fields.image, workspaceSlug, WORKSPACE_POST_FOLDERS)
  for (const attachment of fields.attachments) {
    assertWorkspaceAssetUrl(attachment.url, workspaceSlug, WORKSPACE_POST_FOLDERS)
  }
}

export function assertCommentAttachmentUrls(
  attachments: { url: string }[] | undefined,
  workspaceSlug: string,
): void {
  if (!attachments?.length) return
  for (const attachment of attachments) {
    assertWorkspaceAssetUrl(attachment.url, workspaceSlug, WORKSPACE_COMMENT_FOLDERS)
  }
}
