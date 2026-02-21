import type { QueryClient, QueryKey } from "@tanstack/react-query";

export type ImportIssue = {
  row: number | null;
  message: string;
};

export type ImportResult = {
  ok: true;
  importedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: ImportIssue[];
  warnings: ImportIssue[];
  rowLimit: number;
};

export function parseImportResultPayload(payload: unknown): ImportResult | null {
  if (!isRecord(payload) || payload.ok !== true) return null;

  return {
    ok: true,
    importedCount: toNumber(payload.importedCount),
    createdCount: toNumber(payload.createdCount),
    updatedCount: toNumber(payload.updatedCount),
    skippedCount: toNumber(payload.skippedCount),
    errorCount: toNumber(payload.errorCount),
    errors: toIssueArray(payload.errors),
    warnings: toIssueArray(payload.warnings),
    rowLimit: toNumber(payload.rowLimit, 5000),
  };
}

export function readImportErrorMessage(payload: unknown, fallback: string): string {
  if (!isRecord(payload)) return fallback;
  const message = payload.message;
  if (typeof message === "string" && message.trim().length > 0) {
    return message.trim();
  }
  return fallback;
}

export async function invalidateWorkspaceImportQueries(
  queryClient: QueryClient,
  slug: string
): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["status-counts", slug] }),
    queryClient.invalidateQueries({ queryKey: ["boards", slug] }),
    queryClient.invalidateQueries({ queryKey: ["feedback-boards", slug] }),
    queryClient.invalidateQueries({ queryKey: ["boards-map", slug] }),
    queryClient.invalidateQueries({
      predicate: (query) => {
        const key = query.queryKey as QueryKey;
        return (
          Array.isArray(key) &&
          key.length > 1 &&
          key[0] === "post-count" &&
          key[1] === slug
        );
      },
    }),
  ]);

  await queryClient.refetchQueries({
    queryKey: ["status-counts", slug],
    type: "active",
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function toIssueArray(value: unknown): ImportIssue[] {
  if (!Array.isArray(value)) return [];
  const next: ImportIssue[] = [];
  for (const item of value) {
    if (!isRecord(item)) continue;
    const message = item.message;
    if (typeof message !== "string" || message.trim().length === 0) continue;

    const rowRaw = item.row;
    let row: number | null = null;
    if (typeof rowRaw === "number" && Number.isFinite(rowRaw)) {
      row = rowRaw;
    } else if (typeof rowRaw === "string" && rowRaw.trim().length > 0) {
      const parsed = Number(rowRaw);
      if (Number.isFinite(parsed)) {
        row = parsed;
      }
    }

    next.push({
      row,
      message: message.trim(),
    });
  }
  return next;
}
