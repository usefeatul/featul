import type { RequestItemData } from "@/types/request"

export type RequestItemRow = Omit<
  RequestItemData,
  | "createdAt"
  | "publishedAt"
  | "updatedAt"
  | "upvotes"
  | "isAnonymous"
  | "isPinned"
  | "isLocked"
  | "isFeatured"
  | "reportCount"
  | "commentCount"
> & {
  createdAt: Date | string
  publishedAt: Date | string | null
  updatedAt?: Date | string | null
  upvotes: number | null
  isAnonymous: boolean | null
  isPinned: boolean | null
  isLocked: boolean | null
  isFeatured: boolean | null
  reportCount: number | null
  commentCount: number | null
}

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : String(value)
}

export function toRequestItemData(row: RequestItemRow): RequestItemData {
  return {
    ...row,
    commentCount: Number(row.commentCount ?? 0),
    upvotes: Number(row.upvotes ?? 0),
    createdAt: toIso(row.createdAt),
    publishedAt: row.publishedAt ? toIso(row.publishedAt) : null,
    updatedAt: row.updatedAt ? toIso(row.updatedAt) : null,
    isAnonymous: row.isAnonymous ?? undefined,
    isPinned: row.isPinned ?? undefined,
    isLocked: row.isLocked ?? undefined,
    isFeatured: row.isFeatured ?? undefined,
    reportCount: row.reportCount ?? undefined,
  }
}
