import { isReservedWorkspaceName, isReservedWorkspaceSlug } from "./slug"

function parseEmails(value: string | undefined) {
  return new Set(
    String(value ?? "")
      .split(/[\s,]+/)
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  )
}

export function normalizeEmail(email: unknown) {
  return String(email ?? "").trim().toLowerCase()
}

export function getAppCreatorEmails() {
  return parseEmails(process.env.APP_CREATOR_EMAIL)
}

export function isAppCreatorEmail(email: unknown) {
  const value = normalizeEmail(email)
  if (!value) return false
  return getAppCreatorEmails().has(value)
}

export function canUseReservedWorkspaceIdentity(email: unknown) {
  return isAppCreatorEmail(email)
}

export function isReservedSlugBlockedForEmail(slug: string, email?: unknown) {
  return isReservedWorkspaceSlug(slug) && !canUseReservedWorkspaceIdentity(email)
}

export function isReservedNameBlockedForEmail(name: string, email?: unknown) {
  return isReservedWorkspaceName(name) && !canUseReservedWorkspaceIdentity(email)
}
