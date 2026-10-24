import { createHmac, timingSafeEqual } from "node:crypto";

// `<randomUUID or Date.now()>.<tag>-<file>`; the id is server-generated.
const TAGGED_UPLOAD_PATTERN =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}|\d{10,16})\.(u[a-f0-9]{24})-/;

/**
 * Bind widget uploads to their uploader. The tag is an HMAC over the widget
 * user id keyed by the workspace's server-only widget secret, so another
 * visitor cannot forge it even when they know the object URL.
 */
export function widgetUploaderTag(
  widgetSecret: string,
  workspaceId: string,
  uploaderId: string,
) {
  const digest = createHmac("sha256", widgetSecret)
    .update(`widget-upload:${workspaceId}:${uploaderId}`)
    .digest("hex");
  return `u${digest.slice(0, 24)}`;
}

/** Read the uploader tag from `workspaces/<slug>/posts/<id>.<tag>-<file>`. */
export function uploaderTagFromKey(key: string): string | null {
  const fileName = key.split("/").slice(3).join("/");
  return TAGGED_UPLOAD_PATTERN.exec(fileName)?.[1] || null;
}

/** Constant-time tag comparison. */
export function isWidgetUploaderTag(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}
