import type { RequestItemData } from "@/types/request"

export type RequestItemRow = Omit<
  RequestItemData,
  | "createdAt"
  | "publishedAt"
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
  upvotes: number | null
  isAnonymous: boolean | null
  isPinned: boolean | null
  isLocked: boolean | null
  isFeatured: boolean | null
  reportCount: number | null
  commentCount: number | null
}

export function toRequestItemData(row: RequestItemRow): RequestItemData {
  return {
    ...row,
    commentCount: Number(row.commentCount ?? 0),
    upvotes: Number(row.upvotes ?? 0),
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
    publishedAt: row.publishedAt
      ? row.publishedAt instanceof Date
        ? row.publishedAt.toISOString()
        : String(row.publishedAt)
      : null,
    isAnonymous: row.isAnonymous ?? undefined,
    isPinned: row.isPinned ?? undefined,
    isLocked: row.isLocked ?? undefined,
    isFeatured: row.isFeatured ?? undefined,
    reportCount: row.reportCount ?? undefined,
  }
}
