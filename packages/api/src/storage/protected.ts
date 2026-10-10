import { isDeletableContentKey } from "./keys";

export function protectedImageUrl(key: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL;
  if (!base) throw new Error("Image delivery is not configured");
  return `${new URL(base).origin}/api/storage/image?key=${encodeURIComponent(key)}`;
}

export function protectedImageKey(value: string): string | null {
  try {
    const url = new URL(value);
    const key = url.searchParams.get("key");
    if (!key || !isDeletableContentKey(key) || /[\\\x00-\x1f]/.test(key))
      return null;
    return value === protectedImageUrl(key) ? key : null;
  } catch {
    return null;
  }
}
