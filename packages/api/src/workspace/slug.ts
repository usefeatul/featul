export const RESERVED_WORKSPACE_SLUGS = new Set([
  "admin",
  "api",
  "featul",
  "feedback",
  "www",
  "app",
  "support",
  "help",
  "mail",
  "blog",
  "status",
  "docs",
  "pricing",
  "signup",
  "signin",
  "start",
  "invite",
  "reserve",
  "verify",
  "staging",
])

export function normalizeWorkspaceSlugCandidate(input: string): string {
  return input.trim().toLowerCase()
}

export function normalizeWorkspaceNameCandidate(input: string): string {
  return input.trim().toLowerCase().replace(/[^a-z]/g, "")
}

export function isReservedWorkspaceSlug(input: string): boolean {
  return RESERVED_WORKSPACE_SLUGS.has(normalizeWorkspaceSlugCandidate(input))
}

export function isReservedWorkspaceName(input: string): boolean {
  const candidate = normalizeWorkspaceNameCandidate(input)
  return candidate.length > 0 && RESERVED_WORKSPACE_SLUGS.has(candidate)
}
