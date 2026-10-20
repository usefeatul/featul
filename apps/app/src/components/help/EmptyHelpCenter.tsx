"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { Plus, SparklesIcon } from "@/components/global/icons";
import { CollectionDialog } from "./CollectionDialog";
import { openHelpImport } from "./HelpImport";

export function EmptyHelpCenter({ workspaceSlug }: { workspaceSlug: string }) {
  const [open, setOpen] = React.useState(false);
  return (
    <div data-page-empty className="flex flex-1 items-center justify-center">
      <div className="flex flex-col items-center px-4 py-12 text-center">
        <div className="text-sm font-medium text-foreground">No help articles yet</div>
        <p className="mt-1 max-w-sm text-sm text-foreground/50 dark:text-white/45">
          Group answers into collections like Getting started or Billing, then write
          the articles your users keep asking for.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button className="px-4" onClick={openHelpImport}>
            <SparklesIcon className="mr-2 size-4" />
            Draft from your website
          </Button>
          <Button variant="card" className="px-4" onClick={() => setOpen(true)}>
            New collection
          </Button>
          <Button asChild variant="card" className="px-4">
            <Link href={`/workspaces/${workspaceSlug}/help/new`}>
              <Plus className="mr-2 size-4" />
              Write an article
            </Link>
          </Button>
        </div>
      </div>
      <CollectionDialog open={open} onOpenChange={setOpen} workspaceSlug={workspaceSlug} />
    </div>
  );
}
