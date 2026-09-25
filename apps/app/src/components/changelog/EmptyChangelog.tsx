"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@featul/ui/components/button";
import { Plus } from "@/components/global/icons";

interface EmptyChangelogProps {
  workspaceSlug?: string;
}

export default function EmptyChangelog({ workspaceSlug }: EmptyChangelogProps) {
  return (
    <div className="flex min-h-[calc(100dvh-3rem-var(--workspace-mobile-nav-height))] items-center justify-center lg:min-h-[calc(100dvh-3rem)]">
      <div className="-translate-y-6 flex flex-col items-center px-4 py-12 text-center">
        <div className="text-sm font-medium text-foreground">
          No changelogs yet
        </div>
        <p className="mt-1 max-w-sm text-sm text-foreground/50 dark:text-white/45">
          Publish your first changelog to keep your users updated about new
          features and improvements.
        </p>
        {workspaceSlug ? (
          <Button variant="quiet" asChild className="mt-4 px-5">
            <Link href={`/workspaces/${workspaceSlug}/changelog/new`}>
              <Plus className="mr-2 h-4 w-4" />
              Create Entry
            </Link>
          </Button>
        ) : null}
      </div>
    </div>
  );
}
