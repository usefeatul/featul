export const IMAGE_UPLOAD_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const
export const BRANDING_UPLOAD_CONTENT_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"] as const

export const AVATAR_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const POST_IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const COMMENT_IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const CHANGELOG_IMAGE_UPLOAD_MAX_BYTES = 5 * 1024 * 1024
export const BRANDING_LOGO_UPLOAD_MAX_BYTES = 2 * 1024 * 1024

export const SIGNED_UPLOAD_INPUT_MAX_BYTES = 10 * 1024 * 1024
export const SIGNED_UPLOAD_URL_TTL_SECONDS = 60 * 5

export const WORKSPACE_UPLOAD_FOLDERS = ["branding/logo", "changelog/content", "changelog/covers"] as const
export type WorkspaceUploadFolder = (typeof WORKSPACE_UPLOAD_FOLDERS)[number]
