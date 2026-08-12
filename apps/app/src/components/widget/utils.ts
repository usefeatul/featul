import type { IdentifiedUser, WidgetApiBase } from "./types";

export function toPlain(value?: string | null): string {
  if (!value) return "";
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export function publicBoardPostUrl(workspaceSlug: string, postSlug: string): string {
  const slug = workspaceSlug.trim();
  if (typeof window === "undefined") {
    return `https://${slug}.featul.com/board/p/${postSlug}`;
  }
  const { hostname, protocol, port } = window.location;
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1") {
    const hostPort = port ? `:${port}` : "";
    return `${protocol}//${slug}.localhost${hostPort}/board/p/${postSlug}`;
  }
  return `https://${slug}.featul.com/board/p/${postSlug}`;
}

export function publicBoardUrl(workspaceSlug: string): string {
  const slug = workspaceSlug.trim();
  if (typeof window === "undefined") return `https://${slug}.featul.com`;
  const { hostname, protocol, port } = window.location;
  if (hostname === "localhost" || hostname.endsWith(".localhost") || hostname === "127.0.0.1") {
    const hostPort = port ? `:${port}` : "";
    return `${protocol}//${slug}.localhost${hostPort}`;
  }
  return `https://${slug}.featul.com`;
}

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
    userId: opts.userId || undefined,
    identity:
      opts.identity?.email
        ? {
            id: opts.identity.id,
            email: opts.identity.email,
            name: opts.identity.name,
            avatar: opts.identity.avatar,
            signature: opts.identity.signature,
          }
        : undefined,
    fingerprint: opts.fingerprint || undefined,
  };
}

export function formatRelativeDate(value: string | Date | null | undefined): string {
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

export function resolveBugsBoard<T extends { id: string; name?: string | null; slug?: string | null }>(
  boards: T[],
): T | null {
  if (!boards.length) return null;
  const bySlug = boards.find((board) => String(board.slug || "").toLowerCase() === "bugs");
  if (bySlug) return bySlug;
  const byName = boards.find((board) => String(board.name || "").toLowerCase() === "bugs");
  if (byName) return byName;
  return boards[0] || null;
}
