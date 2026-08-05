"use client";

import { useState } from "react";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { LockIcon } from "@featul/ui/icons/lock";
import { PlusIcon } from "@featul/ui/icons/plus";
import { StarIcon } from "@featul/ui/icons/star";
import { XMarkIcon } from "@featul/ui/icons/xmark";
import { DemoSidebar } from "./sidebar";
import { DemoRequests } from "./requests";
import { DemoRoadmap } from "./roadmap";
import { DemoChangelog } from "./changelog";
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

const TABS: { id: DemoView; label: string }[] = [
  { id: "requests", label: "Featul" },
  { id: "roadmap", label: "Roadmap" },
  { id: "changelog", label: "Changelog" },
];

const INITIAL_VOTES = Object.fromEntries(
  DEMO_POSTS.map((post) => [post.id, Boolean(post.hasVoted)])
);

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className={className}
    >
      <path
        d="M13.65 2.35A7 7 0 1 0 14.5 8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M14.5 2.5v3.2h-3.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ExtensionIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M12.5 6.5h-1.2V4.8A1.3 1.3 0 0 0 10 3.5H8.3V2.3a1.3 1.3 0 1 0-2.6 0v1.2H4A1.3 1.3 0 0 0 2.7 4.8v1.7H1.5a1.3 1.3 0 1 0 0 2.6h1.2V11A1.3 1.3 0 0 0 4 12.3h1.7v1.2a1.3 1.3 0 1 0 2.6 0v-1.2H10A1.3 1.3 0 0 0 11.3 11V9.1h1.2a1.3 1.3 0 1 0 0-2.6Z" />
    </svg>
  );
}

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
      {/* Chrome tab strip */}
      <div className="flex items-end gap-1 border-b border-border/40 bg-muted/60 px-2 pt-1.5">
        <div className="mb-2.5 flex shrink-0 items-center gap-1.5 pl-1.5 pr-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>

        <div className="flex min-w-0 flex-1 items-end gap-0.5 overflow-hidden">
          {TABS.map((tab) => {
            const active = tab.id === view;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onViewChange(tab.id)}
                className={[
                  "group relative flex max-w-[180px] min-w-0 flex-1 cursor-pointer items-center gap-1.5 px-2.5 text-left text-[11px] transition-colors",
                  active
                    ? "z-10 -mb-px h-[34px] rounded-t-lg bg-card text-foreground"
                    : "h-7 rounded-t-md text-accent/90 hover:bg-background/50 hover:text-foreground/80",
                ].join(" ")}
                aria-current={active ? "page" : undefined}
              >
                <FeatulLogoIcon
                  size={12}
                  className={
                    active ? "shrink-0 text-foreground" : "shrink-0 text-accent"
                  }
                />
                <span
                  className={[
                    "min-w-0 flex-1 truncate",
                    active ? "font-semibold" : "font-medium",
                  ].join(" ")}
                >
                  {tab.label}
                </span>
                <span
                  className={[
                    "flex size-3.5 shrink-0 items-center justify-center rounded-full",
                    active
                      ? "text-accent opacity-70 hover:bg-muted hover:opacity-100"
                      : "text-accent/50 opacity-0 group-hover:opacity-70",
                  ].join(" ")}
                >
                  <XMarkIcon size={8} />
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          tabIndex={-1}
          aria-hidden
          className="mb-1.5 mr-1 flex size-6 shrink-0 items-center justify-center rounded-full text-accent/70 hover:bg-background/60 hover:text-accent"
        >
          <PlusIcon className="size-3.5" />
        </button>
      </div>

      {/* Chrome toolbar */}
      <div className="flex items-center gap-1.5 border-b border-border/70 bg-card px-2.5 py-1.5 sm:gap-2">
        <div className="flex shrink-0 items-center gap-0.5" aria-hidden>
          <span className="flex size-6 items-center justify-center rounded-full text-accent/80">
            <ChevronLeftIcon className="size-3.5" />
          </span>
          <span className="flex size-6 items-center justify-center rounded-full text-accent/35">
            <ChevronRightIcon className="size-3.5" />
          </span>
          <span className="flex size-6 items-center justify-center rounded-full text-accent/70">
            <RefreshIcon className="size-3.5" />
          </span>
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-md bg-muted/80 px-3 py-1">
          <LockIcon className="size-2.5 shrink-0 text-accent/70" />
          <span className="min-w-0 flex-1 truncate text-[11px] text-foreground/80">
            {VIEW_PATHS[view]}
          </span>
          <StarIcon className="size-3 shrink-0 text-accent/45" />
        </div>

        <div className="flex shrink-0 items-center gap-0.5" aria-hidden>
          <span className="flex size-6 items-center justify-center rounded-full text-accent/55">
            <ExtensionIcon className="size-3.5" />
          </span>
          <span className="mx-0.5 flex size-5 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-blue-600 text-[9px] font-semibold text-white">
            J
          </span>
          <span className="flex size-6 items-center justify-center rounded-full text-accent/70">
            <svg viewBox="0 0 16 16" fill="currentColor" className="size-3.5">
              <circle cx="8" cy="3.25" r="1.15" />
              <circle cx="8" cy="8" r="1.15" />
              <circle cx="8" cy="12.75" r="1.15" />
            </svg>
          </span>
        </div>
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
