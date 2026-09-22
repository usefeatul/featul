import { isSafeWidgetParentOrigin } from "@featul/widget/protocol";

/** Allow only origins the widget protocol treats as a safe parent. */
export function isSafeParentOrigin(value?: string | null): value is string {
  return isSafeWidgetParentOrigin(value);
}

/** Allow http(s) image URLs only. Data URLs and junk strings are rejected. */
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
