const CONTENT_FOLDERS = new Set(["posts", "comments"])

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
