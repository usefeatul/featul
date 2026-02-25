import { HTTPException } from "hono/http-exception"
import {
  SIGNED_UPLOAD_URL_TTL_SECONDS,
  IMAGE_UPLOAD_CONTENT_TYPES,
  BRANDING_UPLOAD_CONTENT_TYPES,
  AVATAR_UPLOAD_MAX_BYTES,
  POST_IMAGE_UPLOAD_MAX_BYTES,
  COMMENT_IMAGE_UPLOAD_MAX_BYTES,
  CHANGELOG_IMAGE_UPLOAD_MAX_BYTES,
  BRANDING_LOGO_UPLOAD_MAX_BYTES,
  type WorkspaceUploadFolder,
} from "../upload-policy"

export { SIGNED_UPLOAD_URL_TTL_SECONDS, type WorkspaceUploadFolder }

export type UploadPolicy = {
  allowedContentTypes: Set<string>
  maxBytes: number
}

const IMAGE_CONTENT_TYPES = new Set<string>(IMAGE_UPLOAD_CONTENT_TYPES)
const BRANDING_CONTENT_TYPES = new Set<string>(BRANDING_UPLOAD_CONTENT_TYPES)

export const AVATAR_UPLOAD_POLICY: UploadPolicy = {
  allowedContentTypes: IMAGE_CONTENT_TYPES,
  maxBytes: AVATAR_UPLOAD_MAX_BYTES,
}

export const POST_IMAGE_UPLOAD_POLICY: UploadPolicy = {
  allowedContentTypes: IMAGE_CONTENT_TYPES,
  maxBytes: POST_IMAGE_UPLOAD_MAX_BYTES,
}

export const COMMENT_IMAGE_UPLOAD_POLICY: UploadPolicy = {
  allowedContentTypes: IMAGE_CONTENT_TYPES,
  maxBytes: COMMENT_IMAGE_UPLOAD_MAX_BYTES,
}

export const WORKSPACE_UPLOAD_POLICIES: Record<WorkspaceUploadFolder, UploadPolicy> = {
  "branding/logo": {
    allowedContentTypes: BRANDING_CONTENT_TYPES,
    maxBytes: BRANDING_LOGO_UPLOAD_MAX_BYTES,
  },
  "changelog/content": {
    allowedContentTypes: IMAGE_CONTENT_TYPES,
    maxBytes: CHANGELOG_IMAGE_UPLOAD_MAX_BYTES,
  },
  "changelog/covers": {
    allowedContentTypes: IMAGE_CONTENT_TYPES,
    maxBytes: CHANGELOG_IMAGE_UPLOAD_MAX_BYTES,
  },
}

const MIME_EXTENSIONS: Record<string, string[]> = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/gif": [".gif"],
  "image/svg+xml": [".svg"],
}

export function sanitizeFileName(name: string): string {
  const cleaned = name
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^[-.]+|[-.]+$/g, "")
  return cleaned || "upload"
}

export function resolveWorkspaceUploadFolder(folder: string | undefined): WorkspaceUploadFolder {
  const normalized = (folder || "branding/logo").trim()
  if (!Object.prototype.hasOwnProperty.call(WORKSPACE_UPLOAD_POLICIES, normalized)) {
    throw new HTTPException(400, { message: "Invalid upload folder" })
  }
  return normalized as WorkspaceUploadFolder
}

function hasAllowedFileExtension(fileName: string, contentType: string): boolean {
  const allowedExtensions = MIME_EXTENSIONS[contentType]
  if (!allowedExtensions) return false
  const lowerName = fileName.toLowerCase()
  return allowedExtensions.some((ext) => lowerName.endsWith(ext))
}

export function validateUploadInput({
  fileName,
  contentType,
  fileSize,
  policy,
}: {
  fileName: string
  contentType: string
  fileSize: number
  policy: UploadPolicy
}): { safeFileName: string; normalizedContentType: string } {
  const normalizedContentType = contentType.trim().toLowerCase()
  if (!policy.allowedContentTypes.has(normalizedContentType)) {
    throw new HTTPException(400, { message: "Unsupported file type" })
  }
  if (fileSize > policy.maxBytes) {
    throw new HTTPException(400, { message: `File too large. Max size is ${Math.floor(policy.maxBytes / (1024 * 1024))}MB` })
  }
  if (!hasAllowedFileExtension(fileName, normalizedContentType)) {
    throw new HTTPException(400, { message: "File extension does not match content type" })
  }
  return { safeFileName: sanitizeFileName(fileName), normalizedContentType }
}
