import { protectedImageKey } from "./protected"
export { isDeletableContentKey, workspaceSlugFromContentKey } from "./keys"

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
  const protectedKey = protectedImageKey(publicUrl)
  if (protectedKey) return protectedKey
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

  let key: string
  try {
    key = decodeURIComponent((basePath ? path.slice(basePath.length) : path).replace(/^\//, ""))
  } catch { return null }
  if (!key || key.startsWith("/") || key.includes("..") || key.includes("//")) {
    return null
  }
  return key
}
