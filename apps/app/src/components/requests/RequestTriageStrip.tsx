"use client"

import BoardPicker from "./meta/BoardPicker"
import StatusPicker from "./meta/StatusPicker"
import TagsPicker from "./meta/TagsPicker"
import StatusIcon from "./StatusIcon"
import type { TagSummary } from "@/types/post"
import { statusLabel } from "@/lib/roadmap"

type BoardValue = { name: string; slug: string }

export type RequestTriageStripProps = {
  postId: string
  workspaceSlug: string
  canEdit: boolean
  roadmapStatus?: string | null
  onStatusChange: (value: string) => void
  board: BoardValue
  onBoardChange: (value: BoardValue) => void
  tags: TagSummary[]
  onTagsChange: (value: TagSummary[]) => void
}

export default function RequestTriageStrip({
  postId,
  workspaceSlug,
  canEdit,
  roadmapStatus,
  onStatusChange,
  board,
  onBoardChange,
  tags,
  onTagsChange,
}: RequestTriageStripProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {canEdit ? (
        <StatusPicker
          postId={postId}
          value={roadmapStatus}
          onChange={onStatusChange}
          className="h-7"
        />
      ) : (
        <div className="inline-flex h-7 items-center rounded-md border px-2 pl-1.5 text-xs font-medium">
          <StatusIcon status={roadmapStatus || "pending"} className="mr-1.5 size-4" />
          <span className="capitalize">{statusLabel(String(roadmapStatus || "pending"))}</span>
        </div>
      )}

      <span aria-hidden className="text-border">·</span>

      {canEdit ? (
        <BoardPicker
          workspaceSlug={workspaceSlug}
          postId={postId}
          value={board}
          onChange={onBoardChange}
          className="h-7"
        />
      ) : (
        <div className="inline-flex h-7 items-center rounded-md border px-2.5 text-xs font-medium">
          {board.name}
        </div>
      )}

      {(canEdit || tags.length > 0) && (
        <>
          <span aria-hidden className="text-border">·</span>
          {canEdit ? (
            <TagsPicker
              workspaceSlug={workspaceSlug}
              postId={postId}
              value={tags}
              onChange={onTagsChange}
              className="items-start"
            />
          ) : (
            <div className="flex flex-wrap gap-1">
              {tags.map((tag) => (
                <span
                  key={tag.id}
                  className="inline-flex h-7 items-center rounded-md border border-primary/25 bg-primary/10 px-2 text-xs font-medium text-primary"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
