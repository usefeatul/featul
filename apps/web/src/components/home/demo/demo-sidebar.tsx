"use client";

import { useEffect, useState } from "react";
import { cn } from "@featul/ui/lib/utils";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { ChevronExpandIcon } from "@featul/ui/icons/chevron-expand";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { MemberIcon } from "@featul/ui/icons/member";
import { BoardIcon } from "@featul/ui/icons/board";
import { SettingIcon } from "@featul/ui/icons/setting";
import { DocIcon } from "@featul/ui/icons/doc";
import { PlusIcon } from "@featul/ui/icons/plus";
import {
  DEMO_STATUS_LABELS,
  demoStatusCounts,
  type DemoStatus,
  type DemoView,
} from "./data";
import { DemoStatusIcon } from "./demo-status-icon";
import { DemoAvatar } from "./demo-avatar";

const STATUSES: DemoStatus[] = [
  "planned",
  "progress",
  "review",
  "completed",
  "pending",
  "closed",
];

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-3 pb-1 pt-3 text-[10px] font-medium tracking-wider text-accent/80">
      {children}
    </div>
  );
}

function LiveClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const update = () =>
      setTime(
        new Intl.DateTimeFormat("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date())
      );
    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="rounded-sm border border-border/70 bg-card px-1.5 py-0.5 text-[10px] tabular-nums text-accent">
      {time ?? "––:––"}
    </span>
  );
}

export function DemoSidebar({
  view,
  statusFilter,
  onSelectStatus,
  onSelectView,
}: {
  view: DemoView;
  statusFilter: DemoStatus | null;
  onSelectStatus: (status: DemoStatus | null) => void;
  onSelectView: (view: DemoView) => void;
}) {
  const counts = demoStatusCounts();

  const workspaceNav: {
    label: string;
    icon: React.ReactNode;
    shortcut?: string;
    view?: DemoView;
  }[] = [
    {
      label: "Roadmap",
      icon: <RoadmapIcon className="size-4" />,
      shortcut: "R",
      view: "roadmap",
    },
    {
      label: "Changelog",
      icon: <ChangelogIcon className="size-4" />,
      shortcut: "C",
      view: "changelog",
    },
    { label: "Members", icon: <MemberIcon className="size-4" />, shortcut: "M" },
    { label: "My Board", icon: <BoardIcon className="size-4" />, shortcut: "B" },
    { label: "Settings", icon: <SettingIcon className="size-4" /> },
  ];

  return (
    <aside className="flex w-52 shrink-0 flex-col border-r border-border/60 bg-background/60 text-left">
      <div className="px-3 pt-3">
        <div className="flex items-center gap-2 px-1">
          <FeatulLogoIcon className="size-5" />
          <span className="text-sm font-semibold text-foreground">Featul</span>
        </div>

        <button
          type="button"
          className="mt-3 flex w-full cursor-default items-center gap-2 rounded-md border border-border/70 bg-card px-2 py-1.5 shadow-xs"
        >
          <span className="inline-flex size-5 shrink-0 overflow-hidden rounded-full bg-muted ring-1 ring-border/60">
            <img
              src="https://api.dicebear.com/9.x/shapes/svg?seed=acme"
              alt=""
              draggable={false}
              className="size-full"
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-medium text-foreground">
              acme
            </span>
            <span className="block text-[9px] leading-3 text-accent">
              Starter
            </span>
          </span>
          <ChevronExpandIcon className="size-3.5 text-accent" />
        </button>

        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-[10px] font-medium tracking-wider text-accent/80">
            TIME
          </span>
          <LiveClock />
        </div>
      </div>

      <div className="flex-1 overflow-hidden px-2">
        <SectionLabel>REQUEST</SectionLabel>
        <nav className="space-y-0.5">
          {STATUSES.map((status) => {
            const isActive = view === "requests" && statusFilter === status;
            return (
              <button
                key={status}
                type="button"
                onClick={() => onSelectStatus(isActive ? null : status)}
                className={cn(
                  "flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
                  isActive
                    ? "bg-card text-foreground ring-1 ring-border"
                    : "text-accent hover:bg-card hover:text-foreground"
                )}
              >
                <DemoStatusIcon status={status} className="size-3.5" />
                <span className="flex-1 truncate text-left">
                  {DEMO_STATUS_LABELS[status]}
                </span>
                <span className="rounded-sm border border-border/60 bg-card px-1 text-[9px] tabular-nums text-accent">
                  {counts[status]}
                </span>
              </button>
            );
          })}
        </nav>

        <SectionLabel>WORKSPACE</SectionLabel>
        <nav className="space-y-0.5">
          {workspaceNav.map((item) => {
            const isActive = item.view ? view === item.view : false;
            return (
              <button
                key={item.label}
                type="button"
                onClick={item.view ? () => onSelectView(item.view!) : undefined}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1 text-xs transition-colors",
                  item.view ? "cursor-pointer" : "cursor-default",
                  isActive
                    ? "bg-card text-foreground ring-1 ring-border"
                    : "text-accent hover:bg-card hover:text-foreground"
                )}
              >
                <span className="text-accent">{item.icon}</span>
                <span className="flex-1 truncate text-left">{item.label}</span>
                {item.shortcut ? (
                  <span className="rounded-sm border border-border/60 bg-card px-1 text-[9px] text-accent">
                    {item.shortcut}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>
      </div>

      <div className="space-y-0.5 border-t border-border/60 p-2">
        <button
          type="button"
          className="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs text-accent hover:bg-card hover:text-foreground"
        >
          <PlusIcon className="size-4" />
          Create Posts
        </button>
        <button
          type="button"
          className="flex w-full cursor-default items-center gap-2 rounded-md px-2 py-1 text-xs text-accent hover:bg-card hover:text-foreground"
        >
          <DocIcon className="size-4" />
          Docs
        </button>
        <div className="flex items-center gap-2 rounded-md px-2 py-1">
          <DemoAvatar name="Jean Daly" className="size-5 text-[8px]" />
          <span className="text-xs text-accent">Jean Daly</span>
        </div>
      </div>
    </aside>
  );
}
