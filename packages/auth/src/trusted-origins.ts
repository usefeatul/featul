const INVALID_ORIGIN_WARNINGS = new Set<string>()

function splitOriginPatterns(value: string): string[] {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

function isLocalDevHost(host: string): boolean {
  const normalized = host.toLowerCase()
  return (
    normalized === "localhost" ||
    normalized === "127.0.0.1" ||
    normalized.endsWith(".localhost")
  )
}

function normalizeOriginPattern(pattern: string): string | null {
  const trimmed = pattern.trim()
  if (!trimmed) return null
  if (trimmed === "*" || trimmed === "http://*" || trimmed === "https://*") {
    return null
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  const protocol = parsed.protocol.toLowerCase()
  if (protocol !== "http:" && protocol !== "https:") return null

  if (
    (parsed.pathname && parsed.pathname !== "/") ||
    parsed.search ||
    parsed.hash ||
    parsed.username ||
    parsed.password
  ) {
    return null
  }

  const host = parsed.hostname.toLowerCase()
  if (!host || host === "*") return null

  if (host.includes("*")) {
    if (!host.startsWith("*.")) return null
    const suffix = host.slice(2)
    if (!suffix || suffix.includes("*")) return null
    if (suffix !== "localhost" && !suffix.includes(".")) return null
  }

  if (process.env.NODE_ENV === "production") {
    if (protocol !== "https:") return null
    const hostWithoutWildcard = host.startsWith("*.") ? host.slice(2) : host
    if (isLocalDevHost(hostWithoutWildcard)) return null
  }

  const port = parsed.port ? `:${parsed.port}` : ""
  return `${protocol}//${host}${port}`
}

type ParsedTrustedOrigins = {
  invalid: string[]
  origins: string[]
}

function parseTrustedOrigins(rawValue: string): ParsedTrustedOrigins {
  const invalid: string[] = []
  const origins: string[] = []

  for (const pattern of splitOriginPatterns(rawValue)) {
    const normalized = normalizeOriginPattern(pattern)
    if (!normalized) {
      invalid.push(pattern)
      continue
    }
    origins.push(normalized)
  }

  return {
    invalid,
    origins: Array.from(new Set(origins)),
  }
}

function reportInvalidPatterns(envName: string, invalid: string[]): void {
  if (invalid.length === 0) return

  const message = `Invalid trusted origin entries in ${envName}: ${invalid.join(", ")}`
  if (process.env.NODE_ENV === "production") {
    throw new Error(message)
  }

  if (INVALID_ORIGIN_WARNINGS.has(message)) return
  INVALID_ORIGIN_WARNINGS.add(message)
  console.warn(`${message}. Ignoring invalid entries in non-production environments.`)
}

export function getValidatedTrustedOrigins(envName: string, rawValue?: string): string[] {
  const parsed = parseTrustedOrigins(rawValue ?? process.env[envName] ?? "")
  reportInvalidPatterns(envName, parsed.invalid)
  return parsed.origins
}

export function isConfiguredTrustedOrigin(origin: string, trustedOriginPatterns: string[]): boolean {
  const value = String(origin || "").trim()
  if (!value) return false

  let parsedOrigin: URL
  try {
    parsedOrigin = new URL(value)
  } catch {
    return false
  }

  const target = parsedOrigin.origin
  for (const pattern of trustedOriginPatterns) {
    const regex = patternToRegex(pattern)
    if (regex && regex.test(target)) return true
  }

  return false
}

function patternToRegex(originPattern: string): RegExp | null {
  const trimmed = originPattern.trim()
  if (!trimmed) return null

  if (!trimmed.includes("*")) {
    return new RegExp(`^${trimmed.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`)
  }

  const escaped = trimmed
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    .replace(/\\\*/g, ".*")

  return new RegExp(`^${escaped}$`)
}
