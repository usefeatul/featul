"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import {
  Toolbar,
  toolbarItemClass,
} from "@featul/ui/components/toolbar";

import { Switch } from "@featul/ui/components/switch";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { SECTIONS, WORKSPACE_TITLES, getSectionMeta } from "@/config/sections";
import { getAccountSectionMeta } from "@/config/account/sections";
import HeaderActions from "@/components/requests/HeaderActions";
import FilterDynamicIsland from "@/components/requests/FilterDynamicIsland";
import RoadmapHeaderActions from "@/components/roadmap/RoadmapHeaderActions";
import { Plus } from "lucide-react";
import { useEditorHeaderActionsOptional } from "@/components/changelog/EditorHeaderContext";
import ImportNotraDialog from "@/components/changelog/ImportNotraDialog";
import { cn } from "@featul/ui/lib/utils";

/** Title from the last path segment via WORKSPACE_TITLES, then SECTIONS. */
function resolveTitle(segment: string): string {
  const s = segment.toLowerCase();
  if (WORKSPACE_TITLES[s]) return WORKSPACE_TITLES[s];
  const found = SECTIONS.find((x) => x.value === s);
  return found ? found.label : "";
}

const compactActionButtonClass =
  "size-8 rounded-md border-0 bg-black/5 p-0 text-accent shadow-none ring-0 before:hidden hover:bg-black/[0.08] hover:text-foreground dark:bg-[#292929] dark:hover:bg-[#303030]";

export default function WorkspaceHeader({
  workspaceName,
}: {
  workspaceName: string;
}) {
  const pathname = usePathname() || "/";
  const parts = pathname.split("/").filter(Boolean);
  const idx = parts.indexOf("workspaces");
  const workspaceSlug = idx >= 0 ? (parts[idx + 1] ?? "") : "";
  const rest = idx >= 0 ? parts.slice(idx + 2) : [];
  const showRequestsActions = rest.length === 0 || rest[0] === "requests";
  const showRoadmapActions = rest[0] === "roadmap" && rest.length === 1;
  const showChangelogActions = rest[0] === "changelog" && rest.length === 1;
  const showChangelogEditActions = rest[0] === "changelog" && rest.length >= 2;
  const isMembersSection = rest[0] === "members";
  const isMemberDetail = isMembersSection && rest.length > 1;
  const isSettingsSection = rest[0] === "settings";
  const isAccountSection = rest[0] === "account";
  const settingsMeta = isSettingsSection
    ? getSectionMeta(rest[1] || "branding")
    : null;
  const accountMeta = isAccountSection
    ? getAccountSectionMeta(rest[1] || "profile")
    : null;
  const editorContext = useEditorHeaderActionsOptional();

  let title = rest.length === 0 ? "Requests" : "";
  if (isSettingsSection) {
    title = settingsMeta?.label || "Settings";
  } else if (isAccountSection) {
    title = accountMeta?.label || "Account";
  } else if (rest.length > 0) {
    const t = resolveTitle(rest[0] ?? "");
    title = t || "";
  }
  if (showChangelogEditActions) {
    title = rest[1] === "new" ? "New changelog" : "Edit changelog";
  }

  const pageActions = isMemberDetail ? (
    <Toolbar size="sm">
      <Button
        asChild
        variant="plain"
        className={`${toolbarItemClass} px-3 text-xs font-medium text-muted-foreground hover:text-foreground`}
      >
        <Link
          href={`/workspaces/${workspaceSlug}/members`}
          aria-label="Back to members"
        >
          <ChevronLeftIcon className="size-3 mr-1" />
          <span className="hidden sm:inline">Back</span>
        </Link>
      </Button>
    </Toolbar>
  ) : showRequestsActions ? (
    <HeaderActions />
  ) : showRoadmapActions ? (
    <RoadmapHeaderActions />
  ) : showChangelogActions ? (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      <ImportNotraDialog
        workspaceSlug={workspaceSlug}
        iconOnly
        triggerClassName={compactActionButtonClass}
      />
      <Button
        asChild
        variant="plain"
        size="icon-sm"
        className={compactActionButtonClass}
      >
        <Link
          href={`/workspaces/${workspaceSlug}/changelog/new`}
          aria-label="New changelog entry"
          title="New changelog entry"
        >
          <Plus className="size-4" />
          <span className="sr-only">New entry</span>
        </Link>
      </Button>
    </div>
  ) : showChangelogEditActions &&
    editorContext &&
    editorContext.actions.length > 0 ? (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      {editorContext.actions.map((action) =>
        action.type === "switch" ? (
          <div
            key={action.key}
            className="flex h-8 items-center gap-2 rounded-md bg-black/5 px-2.5 text-xs font-medium text-muted-foreground dark:bg-[#292929]"
          >
            <span>{action.label}</span>
            <Switch checked={action.checked} onCheckedChange={action.onClick} />
          </div>
        ) : (
          <Button
            key={action.key}
            variant="plain"
            size="icon-sm"
            onClick={action.onClick}
            disabled={action.disabled}
            aria-pressed={action.active || undefined}
            aria-label={action.label || "Back to changelog"}
            title={action.label || "Back to changelog"}
            className={cn(
              compactActionButtonClass,
              action.active && "bg-black/[0.08] text-foreground dark:bg-[#303030]",
            )}
          >
            {action.icon}
            <span className="sr-only">
              {action.label || "Back to changelog"}
            </span>
          </Button>
        ),
      )}
    </div>
  ) : null;

  if (rest[0] === "requests" && rest.length > 1) return null;
  if (!title && !pageActions) return null;

  const showFilterSummary = showRequestsActions || showRoadmapActions;

  const showPageHeading = rest.length === 0 || rest.length === 1;

  const isRequestList =
    rest.length === 0 || (rest[0] === "requests" && rest.length === 1);

  const isCompactListHeader =
    isRequestList ||
    showRoadmapActions ||
    showChangelogActions ||
    showChangelogEditActions;

  if (isCompactListHeader) {
    return (
      <header className="relative z-20 shrink-0 bg-background px-4 sm:px-6 dark:bg-[#191919]">
        <div className="flex min-h-12 items-center justify-between gap-3">
          <h1 className="shrink-0 text-sm font-medium">{title}</h1>
          {showRequestsActions || showRoadmapActions ? (
            <FilterDynamicIsland />
          ) : null}
          {pageActions}
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-20 shrink-0 bg-background dark:bg-[#191919]">
      <div className="flex min-h-12 items-center gap-2 px-4 text-sm sm:px-6">
        <Link
          href={`/workspaces/${workspaceSlug}`}
          className="max-w-48 truncate rounded-md px-1.5 py-1 text-accent transition-colors hover:bg-muted dark:hover:bg-white/5"
        >
          {workspaceName}
        </Link>
        <span aria-hidden className="text-accent/50">
          /
        </span>
        <span className="truncate font-medium">{title}</span>
        {!showPageHeading ? <div className="ml-auto">{pageActions}</div> : null}
      </div>
      <div
        className={cn(
          "px-4 sm:px-8 lg:px-12 xl:px-16",
          showPageHeading ? "pt-5 sm:pt-9" : "pt-3",
        )}
      >
        {showPageHeading ? (
          <div className="pb-5 sm:pb-7">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              {title}
            </h1>
            {settingsMeta?.desc || accountMeta?.desc ? (
              <p className="mt-2 text-sm text-accent">
                {settingsMeta?.desc || accountMeta?.desc}
              </p>
            ) : null}
          </div>
        ) : null}
        <div
          className={cn(
            "flex min-h-11 flex-wrap items-center justify-between gap-2 pb-2",
            !showPageHeading && "mb-5",
            isSettingsSection && "mx-auto w-full max-w-4xl",
          )}
        >
          {showFilterSummary ? (
            <FilterDynamicIsland />
          ) : (
            <span className="text-sm text-accent">
              {settingsMeta?.desc || accountMeta?.desc || title}
            </span>
          )}
          {showPageHeading ? pageActions : null}
        </div>
      </div>
    </header>
  );
}
