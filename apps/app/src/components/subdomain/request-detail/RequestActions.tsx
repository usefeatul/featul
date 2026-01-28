"use client";

import React, { useState } from "react";
import { MoreVertical } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverSeparator,
} from "@featul/ui/components/popover";
import { Button } from "@featul/ui/components/button";
import { RequestEditAction } from "./actions/RequestEditAction";
import { RequestShareAction } from "./actions/RequestShareAction";
import { RequestReportAction } from "./actions/RequestReportAction";
import { RequestDeleteAction } from "./actions/RequestDeleteAction";
import EditPostModal from "./EditPostModal";
import ReportPostDialog from "./ReportPostDialog";
import type { SubdomainRequestDetailData } from "../../../types/subdomain";

interface RequestActionsProps {
  post: SubdomainRequestDetailData;
  workspaceSlug: string;
}

export function RequestActions({ post, workspaceSlug }: RequestActionsProps) {
  const [editOpen, setEditOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="plain" size="icon" className="h-8 w-8 bg-card">
            <MoreVertical className="size-4" />
            <span className="sr-only">More options</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-fit" list>
          <PopoverList>
            <RequestEditAction onClick={() => setEditOpen(true)} />
            <RequestShareAction />
            <RequestReportAction onClick={() => setReportOpen(true)} />
            <PopoverSeparator />
            <RequestDeleteAction postId={post.id} workspaceSlug={workspaceSlug} />
          </PopoverList>
        </PopoverContent>
      </Popover>

      <EditPostModal
        open={editOpen}
        onOpenChange={setEditOpen}
        workspaceSlug={workspaceSlug}
        post={post}
      />

      <ReportPostDialog
        open={reportOpen}
        onOpenChange={setReportOpen}
        postId={post.id}
      />
    </>
  );
}
