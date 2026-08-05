"use client";

import React from "react";
import { Button } from "@featul/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { ROADMAP_STATUSES, statusLabel } from "@/lib/roadmap";

export default function RoadmapBulkToolbar({
  workspaceSlug,
  selectedIds,
  onClear,
  onComplete,
}: {
  workspaceSlug: string;
  selectedIds: string[];
  onClear: () => void;
  onComplete: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  const moveSelected = async (roadmapStatus: string) => {
    if (selectedIds.length === 0) return;
    setIsPending(true);
    try {
      const res = await client.board.bulkUpdateRoadmapStatus.$post({
        workspaceSlug,
        postIds: selectedIds,
        roadmapStatus,
      });
      if (!res.ok) throw new Error("Failed to update selected cards");
      toast.success(`Moved ${selectedIds.length} items to ${statusLabel(roadmapStatus)}`);
      onComplete();
      onClear();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bulk update failed");
    } finally {
      setIsPending(false);
    }
  };

  if (selectedIds.length === 0) return null;

  return (
    <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 ring-1 ring-border/60">
      <span className="text-xs text-accent">{selectedIds.length} selected</span>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button type="button" variant="card" size="sm" className="h-7 px-3 text-xs" disabled={isPending}>
            Move to…
          </Button>
        </PopoverTrigger>
        <PopoverContent list className="min-w-0 w-fit">
          <PopoverList>
            {(ROADMAP_STATUSES as readonly string[]).map((status) => (
              <PopoverListItem key={status} onClick={() => moveSelected(status)}>
                <span className="text-sm">{statusLabel(status)}</span>
              </PopoverListItem>
            ))}
          </PopoverList>
        </PopoverContent>
      </Popover>
      <Button type="button" variant="ghost" size="sm" className="ml-auto h-7 px-3 text-xs" onClick={onClear}>
        Clear
      </Button>
    </div>
  );
}
