import { client } from "@featul/api/client";
import type { IdentifiedUser, WidgetApiBase } from "./types";

/** Strip HTML tags. Collapse whitespace. Empty in → empty out. */
export function toPlain(value?: string | null): string {
  if (!value) return "";
  return value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** First N sentences after HTML strip. Hard-cap at 180 chars with ellipsis. */
export function toShortPreview(
  value?: string | null,
  maxSentences = 2,
): string {
  const plain = toPlain(value);
  if (!plain) return "";

  const sentences = plain.match(/[^.!?]+[.!?]+|[^.!?]+$/g);
  if (!sentences?.length) return plain;

  const clipped = sentences
    .slice(0, Math.max(1, maxSentences))
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");

  return clipped.length > 180 ? `${clipped.slice(0, 177).trimEnd()}…` : clipped;
}

/** Public post URL for the workspace subdomain. Localhost keeps protocol/port. */
export function publicBoardPostUrl(
  workspaceSlug: string,
  postSlug: string,
): string {
  const slug = workspaceSlug.trim();
  if (typeof window === "undefined") {
    return `https://${slug}.featul.com/board/p/${postSlug}`;
  }
  const { hostname, protocol, port } = window.location;
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1"
  ) {
    const hostPort = port ? `:${port}` : "";
    return `${protocol}//${slug}.localhost${hostPort}/board/p/${postSlug}`;
  }
  return `https://${slug}.featul.com/board/p/${postSlug}`;
}

/** Workspace board origin. SSR and prod use featul.com; local uses *.localhost. */
export function publicBoardUrl(workspaceSlug: string): string {
  const slug = workspaceSlug.trim();
  if (typeof window === "undefined") return `https://${slug}.featul.com`;
  const { hostname, protocol, port } = window.location;
  if (
    hostname === "localhost" ||
    hostname.endsWith(".localhost") ||
    hostname === "127.0.0.1"
  ) {
    const hostPort = port ? `:${port}` : "";
    return `${protocol}//${slug}.localhost${hostPort}`;
  }
  return `https://${slug}.featul.com`;
}

/** Merge API base with signed identity or fingerprint. Unsigned identity is omitted. */
export function viewerPayload(
  apiBase: WidgetApiBase,
  opts: {
    userId?: string | null;
    identity?: IdentifiedUser | null;
    fingerprint?: string | null;
  },
) {
  return {
    ...apiBase,
    identity:
      opts.identity?.email && opts.identity.expiresAt
        ? {
            id: opts.identity.id,
            email: opts.identity.email,
            name: opts.identity.name,
            avatar: opts.identity.avatar,
            expiresAt: opts.identity.expiresAt,
            signature: opts.identity.signature,
          }
        : undefined,
    fingerprint: opts.fingerprint || undefined,
  };
}

/** Compact relative time (m/h/d). Falls back to locale date after 30 days. */
export function formatRelativeDate(
  value: string | Date | null | undefined,
): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toLocaleDateString();
}

export function isAllowedImageType(
  type: string,
  allowed: readonly string[],
): boolean {
  return allowed.some((item) => item === type);
}

/** Read a non-empty `message` string from unknown errors. Else the fallback. */
export function readErrorMessage(value: unknown, fallback: string): string {
  if (
    value &&
    typeof value === "object" &&
    "message" in value &&
    typeof value.message === "string" &&
    value.message.trim()
  ) {
    return value.message;
  }
  return fallback;
}

/** Require both signed PUT URL and public URL. Incomplete payloads return null. */
export function readSignedUpload(
  value: unknown,
): { uploadUrl: string; publicUrl: string } | null {
  if (!value || typeof value !== "object") return null;
  const uploadUrl =
    "uploadUrl" in value && typeof value.uploadUrl === "string"
      ? value.uploadUrl
      : "";
  const publicUrl =
    "publicUrl" in value && typeof value.publicUrl === "string"
      ? value.publicUrl
      : "";
  if (!uploadUrl || !publicUrl) return null;
  return { uploadUrl, publicUrl };
}

/** Best-effort remote delete after the UI already dropped the image. */
export async function deleteWidgetUploadedImage(opts: {
  apiBase: WidgetApiBase;
  url: string;
  userId?: string | null;
  identity?: IdentifiedUser | null;
  fingerprint?: string | null;
}): Promise<void> {
  try {
    await client.widget.deleteImage.$post({
      ...viewerPayload(opts.apiBase, {
        userId: opts.userId,
        identity: opts.identity,
        fingerprint: opts.fingerprint,
      }),
      url: opts.url,
    });
  } catch {
    // Best-effort: UI already dropped the image.
  }
}

/** Pull `user.id` from identify payloads. Missing or non-string id → null. */
export function readIdentifiedUserId(value: unknown): string | null {
  if (!value || typeof value !== "object" || !("user" in value)) return null;
  const user = value.user;
  if (
    !user ||
    typeof user !== "object" ||
    !("id" in user) ||
    typeof user.id !== "string"
  ) {
    return null;
  }
  return user.id;
}

/** Accept png/jpeg/webp data URLs only. Reject empty, tiny, or oversized payloads. */
export function isWidgetScreenshotDataUrl(value?: string | null): value is string {
  const url = String(value || "");
  return (
    /^data:image\/(png|jpeg|jpg|webp);base64,/i.test(url) &&
    url.length > 32 &&
    url.length < 12_000_000
  );
}

/** Parse host screenshot replies. Invalid data URLs become cancelled vs capture-failed. */
export function readScreenshotPayload(
  value: unknown,
): { dataUrl: string | null; error: "cancelled" | "capture-failed" | null } {
  if (!value || typeof value !== "object") {
    return { dataUrl: null, error: "capture-failed" };
  }
  const dataUrl =
    "dataUrl" in value && typeof value.dataUrl === "string"
      ? value.dataUrl
      : "";
  if (isWidgetScreenshotDataUrl(dataUrl)) {
    return { dataUrl, error: null };
  }
  const code =
    "error" in value && value.error === "cancelled"
      ? "cancelled"
      : "capture-failed";
  return { dataUrl: null, error: code };
}

/** Convert a data URL to a File. Non-image blobs default to image/jpeg. */
export async function dataUrlToImageFile(
  dataUrl: string,
  fileName: string,
): Promise<File> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const type =
    blob.type && blob.type.startsWith("image/") ? blob.type : "image/jpeg";
  return new File([blob], fileName, { type });
}

/** Prefer a board named/slug `bugs`. Otherwise the first board. */
export function resolveBugsBoard<
  T extends { id: string; name?: string | null; slug?: string | null },
>(boards: T[]): T | null {
  if (!boards.length) return null;
  const bySlug = boards.find(
    (board) => String(board.slug || "").toLowerCase() === "bugs",
  );
  if (bySlug) return bySlug;
  const byName = boards.find(
    (board) => String(board.name || "").toLowerCase() === "bugs",
  );
  if (byName) return byName;
  return boards[0] || null;
}
