"use client";

import React from "react";
import {
  MoreVertical,
  Edit2,
  Share2,
  Flag,
  Trash2,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverList,
  PopoverListItem,
} from "@feedgot/ui/components/popover";
import { Button } from "@feedgot/ui/components/button";

export function RequestActions() {
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
          <PopoverListItem onClick={() => {}}>
            <span className="text-sm">Edit</span>
            <Edit2 className="ml-auto size-4 text-muted-foreground" />
          </PopoverListItem>
          <PopoverListItem onClick={() => {}}>
            <span className="text-sm">Share</span>
            <Share2 className="ml-auto size-4 text-muted-foreground" />
          </PopoverListItem>
          <PopoverListItem onClick={() => {}}>
            <span className="text-sm">Report</span>
            <Flag className="ml-auto size-4 text-muted-foreground" />
          </PopoverListItem>
          <PopoverListItem onClick={() => {}} className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20">
            <span className="text-sm">Delete</span>
            <Trash2 className="ml-auto size-4" />
          </PopoverListItem>
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
}
