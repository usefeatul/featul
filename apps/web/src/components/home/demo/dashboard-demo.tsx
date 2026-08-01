"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import { LockIcon } from "@featul/ui/icons/lock";
import { PlusIcon } from "@featul/ui/icons/plus";
import { DemoSidebar } from "./demo-sidebar";
import { DemoRequests } from "./demo-requests";
import { DemoRoadmap } from "./demo-roadmap";
import { DemoChangelog } from "./demo-changelog";
import {
  DEMO_POSTS,
  DEMO_WORKSPACE,
  type DemoStatus,
  type DemoView,
} from "./data";

const VIEW_PATHS: Record<DemoView, string> = {
  requests: `app.featul.com/workspaces/${DEMO_WORKSPACE.slug}`,
  roadmap: `app.featul.com/workspaces/${DEMO_WORKSPACE.slug}/roadmap`,
  changelog: `app.featul.com/workspaces/${DEMO_WORKSPACE.slug}/changelog`,
};

const INITIAL_VOTES = Object.fromEntries(
  DEMO_POSTS.map((post) => [post.id, Boolean(post.hasVoted)])
);

export function DashboardDemo({
  view,
  onViewChange,
}: {
  view: DemoView;
  onViewChange: (view: DemoView) => void;
}) {
  const [statusFilter, setStatusFilter] = useState<DemoStatus | null>(null);
  const [votes, setVotes] = useState<Record<string, boolean>>(INITIAL_VOTES);

  const toggleVote = (id: string) =>
    setVotes((prev) => ({ ...prev, [id]: !prev[id] }));

  const selectStatus = (status: DemoStatus | null) => {
    setStatusFilter(status);
    onViewChange("requests");
  };

  return (
    <div className="flex h-full flex-col bg-background">
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border/70 bg-card px-3 py-2 sm:gap-3">
        <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex shrink-0 items-center gap-0.5" aria-hidden>
          <span className="flex size-5 items-center justify-center rounded-sm text-accent/80">
            <ChevronLeftIcon className="size-3" />
          </span>
          <span className="flex size-5 items-center justify-center rounded-sm text-accent/40">
            <ChevronRightIcon className="size-3" />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 justify-center">
          <span className="inline-flex max-w-full items-center gap-1.5 truncate rounded-md border border-border/60 bg-background px-3 py-1 text-[10px] text-accent shadow-xs">
            <LockIcon className="size-2.5 shrink-0 text-accent/70" />
            <span className="truncate">{VIEW_PATHS[view]}</span>
          </span>
        </div>

        <span
          aria-hidden
          className="flex size-5 shrink-0 items-center justify-center rounded-sm text-accent/60"
        >
          <PlusIcon className="size-3.5" />
        </span>
      </div>

      {/* App body */}
      <div className="flex min-h-0 flex-1">
        <DemoSidebar
          view={view}
          statusFilter={statusFilter}
          onSelectStatus={selectStatus}
          onSelectView={onViewChange}
        />
        <div className="min-w-0 flex-1 overflow-hidden">
          {view === "requests" ? (
            <DemoRequests
              statusFilter={statusFilter}
              votes={votes}
              onToggleVote={toggleVote}
              onClearFilter={() => setStatusFilter(null)}
            />
          ) : view === "roadmap" ? (
            <DemoRoadmap />
          ) : (
            <DemoChangelog />
          )}
        </div>
      </div>
    </div>
  );
}
