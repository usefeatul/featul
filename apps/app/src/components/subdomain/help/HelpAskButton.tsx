"use client";

import React from "react";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { ArrowRight } from "@/components/global/icons";
import CreatePostModal from "../CreatePostModal";
import { usePortalData } from "../PortalDataProvider";

/** Opens the post composer so an unanswered question can become a request. */
export function HelpAskButton({ className }: { className?: string }) {
  const { subdomain } = usePortalData();
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button className={cn("gap-2 pl-3.5 pr-1.5", className)} onClick={() => setOpen(true)}>
        Ask on the board
        <span className="flex size-6 items-center justify-center rounded-md bg-primary-foreground/15">
          <ArrowRight className="size-3.5" />
        </span>
      </Button>
      <CreatePostModal open={open} onOpenChange={setOpen} workspaceSlug={subdomain} boardSlug={subdomain} />
    </>
  );
}
