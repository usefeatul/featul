"use client";

import { useState } from "react";
import BoardPicker from "./meta/BoardPicker";
import StatusPicker from "./meta/StatusPicker";
import FlagsPicker from "./meta/FlagsPicker";
import TagsPicker from "./meta/TagsPicker";
import StatusIcon from "./StatusIcon";
import type { RequestDetailData } from "@/types/request";
import { RequestFlagReadout } from "@/components/global/flag-visuals";

export type PropertiesProps = { post: RequestDetailData; workspaceSlug: string; readonly?: boolean };

export default function Properties({ post, workspaceSlug, readonly }: PropertiesProps) {
  const canEdit = !readonly;
  const [meta, setMeta] = useState({ roadmapStatus: post.roadmapStatus || undefined, isPinned: !!post.isPinned, isLocked: !!post.isLocked, isFeatured: !!post.isFeatured });
  const [board, setBoard] = useState({ name: post.boardName, slug: post.boardSlug });
  const [tags, setTags] = useState(post.tags || []);

  return (
    <div aria-label="Request properties" className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
      {canEdit ? <StatusPicker postId={post.id} value={meta.roadmapStatus} onChange={(value) => setMeta((current) => ({ ...current, roadmapStatus: value }))} /> : <span className="inline-flex h-8 items-center gap-1.5 rounded-md bg-black/5 px-2.5 text-xs font-medium capitalize dark:bg-white/5"><StatusIcon status={meta.roadmapStatus || "pending"} className="size-4" />{meta.roadmapStatus || "Pending"}</span>}
      {canEdit ? <BoardPicker postId={post.id} workspaceSlug={workspaceSlug} value={board} onChange={setBoard} /> : <span className="inline-flex h-8 items-center rounded-md bg-black/5 px-2.5 text-xs font-medium dark:bg-white/5">{board.name}</span>}
      {canEdit ? <FlagsPicker postId={post.id} value={meta} onChange={(value) => setMeta((current) => ({ ...current, ...value }))} /> : <RequestFlagReadout flags={meta} className="flex items-center gap-2" />}
      {canEdit ? <TagsPicker showTags workspaceSlug={workspaceSlug} postId={post.id} value={tags} onChange={setTags} /> : null}
      {!canEdit ? tags.map((tag) => <span key={tag.id} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-black/5 px-2.5 text-xs font-medium dark:bg-white/5"><span className="size-1.5 rounded-full bg-primary" />{tag.name}</span>) : null}
    </div>
  );
}
