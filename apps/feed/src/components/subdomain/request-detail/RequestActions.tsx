"use client";

import React from "react";
import { MoreVertical } from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
} from "@feedgot/ui/components/popover";
import { Button } from "@feedgot/ui/components/button";
import { RequestEditAction } from "./actions/RequestEditAction";
import { RequestShareAction } from "./actions/RequestShareAction";
import { RequestReportAction } from "./actions/RequestReportAction";
import { RequestDeleteAction } from "./actions/RequestDeleteAction";

interface RequestActionsProps {
  postId: string;
}

export function RequestActions({ postId }: RequestActionsProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <MoreVertical className="size-4" />
          <span className="sr-only">More options</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-40">
        <PopoverList>
          <RequestEditAction postId={postId} />
          <RequestShareAction postId={postId} />
          <RequestReportAction postId={postId} />
          <RequestDeleteAction postId={postId} />
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}
