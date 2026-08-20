const CONTENT_FOLDERS = new Set(["posts", "comments"])

export function normalizePublicBase(publicBase: string): string {
  return publicBase.replace(/\/+$/, "")
}

export function publicUrlForKey(publicBase: string, key: string): string {
  return `${normalizePublicBase(publicBase)}/${key}`
}

export function objectKeyFromPublicUrl(
  publicUrl: string,
  publicBase: string,
): string | null {
  let parsed: URL
  try {
    parsed = new URL(publicUrl)
  } catch {
    return null
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return null
  }

  const base = normalizePublicBase(publicBase)
  if (!base) return null

  let baseUrl: URL
  try {
    baseUrl = new URL(base)
  } catch {
    return null
  }
  if (parsed.origin !== baseUrl.origin) return null

  const basePath = baseUrl.pathname.replace(/\/+$/, "")
  const path = parsed.pathname
  if (basePath && !path.startsWith(`${basePath}/`)) return null

  const key = decodeURIComponent(
    (basePath ? path.slice(basePath.length) : path).replace(/^\//, ""),
  )
  if (!key || key.startsWith("/") || key.includes("..") || key.includes("//")) {
    return null
  }
  return key
}

export function isDeletableContentKey(key: string): boolean {
  const parts = key.split("/")
  if (parts.length < 4) return false
  if (parts[0] !== "workspaces") return false
  if (!parts[1] || parts[1].includes(".")) return false
  if (!CONTENT_FOLDERS.has(parts[2] || "")) return false
  const fileName = parts.slice(3).join("/")
  return Boolean(fileName) && !fileName.includes("..")
}

export function workspaceSlugFromContentKey(key: string): string | null {
  if (!isDeletableContentKey(key)) return null
  return key.split("/")[1] || null
}
