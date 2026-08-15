import { isSafeWidgetParentOrigin } from "@featul/widget/protocol";

export function isSafeParentOrigin(value?: string | null): value is string {
  return isSafeWidgetParentOrigin(value);
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
