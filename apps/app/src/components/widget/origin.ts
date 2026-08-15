export function isSafeParentOrigin(value?: string | null): value is string {
  const origin = String(value || "").trim();
  if (!origin) return false;
  try {
    const url = new URL(origin);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafeImageUrl(value?: string | null): value is string {
  const url = String(value || "").trim();
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
