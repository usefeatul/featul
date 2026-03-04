export function parseArrayParam(v: string | null): string[] {
  try {
    if (!v) return [];
    const arr = JSON.parse(v);
    return Array.isArray(arr) ? arr : [];
  } catch {
    // Backward compatibility with previously encoded values.
    try {
      if (!v) return [];
      const decoded = decodeURIComponent(v);
      const arr = JSON.parse(decoded);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
}

export function encodeArray(arr: string[]): string {
  return JSON.stringify(arr);
}

export function toggleValue(selected: string[], value: string): string[] {
  return selected.includes(value)
    ? selected.filter((s) => s !== value)
    : [...selected, value];
}

export function isAllSelected(items: string[], selected: string[]): boolean {
  return items.length > 0 && selected.length === items.length;
}

type SearchParamsLike = { get: (key: string) => string | null };

function resolvePage(prev: SearchParamsLike, page?: number): string {
  return page != null ? String(page) : prev.get("page") || "1";
}

export function buildRequestsUrl(
  slug: string,
  prev: SearchParamsLike,
  overrides: Partial<{
    status: string[];
    board: string[];
    tag: string[];
    order: string;
    search: string;
    page: number;
  }>,
): string {
  const params = new URLSearchParams();
  const status = overrides.status
    ? encodeArray(overrides.status)
    : prev.get("status") || encodeArray([]);
  const board = overrides.board
    ? encodeArray(overrides.board)
    : prev.get("board") || encodeArray([]);
  const tag = overrides.tag
    ? encodeArray(overrides.tag)
    : prev.get("tag") || encodeArray([]);
  const order = overrides.order || prev.get("order") || "newest";
  const search = overrides.search ?? prev.get("search") ?? "";
  const page =
    overrides.page != null ? String(overrides.page) : prev.get("page") || "1";
  params.set("status", status);
  params.set("board", board);
  params.set("tag", tag);
  params.set("order", order);
  params.set("search", search);
  params.set("page", page);

  return `/workspaces/${slug}/requests?${params.toString()}`;
}

export function buildWorkspaceUrl(
  slug: string,
  prev: SearchParamsLike,
  overrides: Partial<{ page: number }>,
): string {
  const page = resolvePage(prev, overrides.page);
  const params = new URLSearchParams();
  params.set("page", page);
  return `/workspaces/${slug}?${params.toString()}`;
}

export function buildChangelogUrl(
  slug: string,
  prev: SearchParamsLike,
  overrides: Partial<{ page: number }>,
): string {
  const page = resolvePage(prev, overrides.page);
  const params = new URLSearchParams();
  params.set("page", page);
  return `/workspaces/${slug}/changelog?${params.toString()}`;
}
