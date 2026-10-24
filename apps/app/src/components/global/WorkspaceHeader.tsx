"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@featul/ui/components/button";

import { Switch } from "@featul/ui/components/switch";
import { Plus } from "@/components/global/icons";
import { BackButton } from "@/components/global/BackButton";
import { SECTIONS, WORKSPACE_TITLES, getSectionMeta } from "@/config/sections";
import HeaderActions from "@/components/requests/HeaderActions";
import FilterDynamicIsland from "@/components/requests/FilterDynamicIsland";
import RoadmapHeaderActions from "@/components/roadmap/RoadmapHeaderActions";

import {
  useEditorHeaderActionsOptional,
  type EditorAction,
} from "@/components/changelog/EditorHeaderContext";
import ImportNotraDialog from "@/components/changelog/ImportNotraDialog";
import { HelpHeaderActions } from "@/components/help/HelpHeaderActions";
import { raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@featul/ui/components/tooltip";
import { PANEL_ARIA_SHORTCUTS } from "@/hooks/shortcut";
import { PanelShortcutKeys } from "@/components/global/keys";

/** Title from the last path segment via WORKSPACE_TITLES, then SECTIONS. */
function resolveTitle(segment: string): string {
  const s = segment.toLowerCase();
  if (WORKSPACE_TITLES[s]) return WORKSPACE_TITLES[s];
  const found = SECTIONS.find((x) => x.value === s);
  return found ? found.label : "";
}

// Matches the requests/roadmap header buttons.
const compactActionButtonClass = cn(
  raisedSurfaceClass,
  "size-8 rounded-lg p-0 text-accent ring-0 before:hidden hover:text-foreground hover:brightness-[0.98] data-[state=open]:brightness-[0.98] dark:hover:brightness-125 dark:data-[state=open]:brightness-125",
);

function EditorActionButton({ action }: { action: EditorAction }) {
  const label = action.label || "Back to changelog";
  const button = (
    <Button
      variant="plain"
      size="icon-sm"
      onClick={action.onClick}
      disabled={action.disabled}
      aria-pressed={action.active || undefined}
      aria-expanded={action.key === "ai" ? Boolean(action.active) : undefined}
      aria-controls={action.key === "ai" ? "changelog-assistant" : undefined}
      id={action.key === "ai" ? "assistant-panel-toggle" : undefined}
      aria-label={label}
      aria-keyshortcuts={action.shortcut ? PANEL_ARIA_SHORTCUTS : undefined}
      title={action.shortcut ? undefined : label}
      className={cn(
        compactActionButtonClass,
        action.active && "text-primary hover:text-primary dark:text-primary",
      )}
    >
      {action.icon}
      <span className="sr-only">{label}</span>
    </Button>
  );

  if (!action.shortcut) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="bottom"
        sideOffset={6}
        className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium"
      >
        <span>{label}</span>
        <PanelShortcutKeys />
      </TooltipContent>
    </Tooltip>
  );
}

export default function WorkspaceHeader({
  embeddedInEditor = false,
  editorActions,
}: {
  embeddedInEditor?: boolean;
  editorActions?: EditorAction[];
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
  const showHelpActions = rest[0] === "help" && rest.length === 1;
  // Help Center sub-pages that get a back button instead of the article editor chrome.
  const helpSubpage =
    rest[0] === "help" ? ({ analytics: "Analytics" } as Record<string, string>)[rest[1] ?? ""] : undefined;
  const isHelpAnalytics = Boolean(helpSubpage);
  const showHelpEditActions =
    rest[0] === "help" && rest.length >= 2 && !isHelpAnalytics;
  const showEditorActions = showChangelogEditActions || showHelpEditActions;
  const isMembersSection = rest[0] === "members";
  const isMemberDetail = isMembersSection && rest.length > 1;
  const isSettingsSection = rest[0] === "settings";
  const settingsMeta = isSettingsSection
    ? getSectionMeta(rest[1] || "branding")
    : null;
  const editorContext = useEditorHeaderActionsOptional();
  const actions = editorActions ?? editorContext?.actions ?? [];
  const hasEmbeddedEditorHeader =
    (rest[0] === "changelog" || rest[0] === "help") &&
    (rest[1] === "new" || rest[2] === "edit");
  let title = rest.length === 0 ? "Requests" : "";
  if (isSettingsSection) {
    title = settingsMeta?.label || "Settings";
  } else if (rest.length > 0) {
    const t = resolveTitle(rest[0] ?? "");
    title = t || "";
  }
  if (showChangelogEditActions) {
    title = rest[1] === "new" ? "New changelog" : "Edit changelog";
  }
  if (showHelpEditActions) {
    title = rest[1] === "new" ? "New article" : "Edit article";
  }
  if (helpSubpage) title = helpSubpage;

  const pageActions = showRequestsActions ? (
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
  ) : showHelpActions ? (
    <HelpHeaderActions
      workspaceSlug={workspaceSlug}
      buttonClassName={compactActionButtonClass}
    />
  ) : showEditorActions && actions.length > 0 ? (
    <div className="ml-auto flex shrink-0 items-center gap-1">
      {actions.map((action) =>
        action.type === "switch" ? (
          <div
            key={action.key}
            className={cn(
              raisedSurfaceClass,
              "flex h-8 items-center gap-2 rounded-lg px-2.5 text-xs font-medium text-muted-foreground",
            )}
          >
            <span>{action.label}</span>
            <Switch checked={action.checked} onCheckedChange={action.onClick} />
          </div>
        ) : action.type === "custom" && action.render ? (
          <Fragment key={action.key}>
            {action.render(compactActionButtonClass)}
          </Fragment>
        ) : (
          <EditorActionButton key={action.key} action={action} />
        ),
      )}
    </div>
  ) : null;

  if (hasEmbeddedEditorHeader && !embeddedInEditor) return null;
  if ((rest[0] === "requests" && rest.length > 1) || isMemberDetail)
    return null;
  if (!title && !pageActions) return null;

  const showFilterSummary = showRequestsActions || showRoadmapActions;

  const showPageHeading = rest.length === 0 || rest.length === 1;

  const isRequestList =
    rest.length === 0 || (rest[0] === "requests" && rest.length === 1);

  const isCompactListHeader =
    isRequestList ||
    rest[0] === "share" ||
    showRoadmapActions ||
    showChangelogActions ||
    showEditorActions ||
    showHelpActions ||
    isHelpAnalytics ||
    (isMembersSection && !isMemberDetail);
  const showHeaderUtilityRow =
    showFilterSummary || Boolean(pageActions) || !showPageHeading;

  if (isCompactListHeader) {
    const editorSection = showHelpEditActions
      ? { label: "Help Center", href: `/workspaces/${workspaceSlug}/help` }
      : { label: "Changelog", href: `/workspaces/${workspaceSlug}/changelog` };
    return (
      <header className="relative z-40 shrink-0 bg-background px-4 sm:px-6">
        <div className="flex min-h-12 min-w-0 items-center justify-between gap-2 sm:gap-3">
          {isHelpAnalytics ? (
            <BackButton
              href={`/workspaces/${workspaceSlug}/help`}
              label="Help Center"
              className="-ml-2"
            />
          ) : embeddedInEditor && showEditorActions ? (
            <BackButton
              href={editorSection.href}
              label={editorSection.label}
              className="-ml-2"
            />
          ) : (
            <h1 className="min-w-0 shrink-0 truncate text-sm font-medium">
              {title}
            </h1>
          )}
          {showRequestsActions || showRoadmapActions ? (
            <FilterDynamicIsland />
          ) : null}
          {pageActions}
        </div>
      </header>
    );
  }

  return (
    <header className="relative z-40 shrink-0 bg-background">
      <div className="flex min-h-12 items-center gap-2 px-4 text-sm sm:px-6">
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
            {settingsMeta?.desc ? (
              <p className="mt-2 text-sm text-accent">
                {settingsMeta?.desc}
              </p>
            ) : null}
          </div>
        ) : null}
        {showHeaderUtilityRow ? (
          <div
            className={cn(
              "flex min-h-11 flex-wrap items-center justify-between gap-2 pb-2",
              !showPageHeading && "mb-5",
              isSettingsSection &&
                "mx-auto w-full max-w-4xl",
            )}
          >
            {showFilterSummary ? (
              <FilterDynamicIsland />
            ) : (
              <span className="text-sm text-accent">
                {settingsMeta?.desc || title}
              </span>
            )}
            {showPageHeading ? pageActions : null}
          </div>
        ) : null}
      </div>
    </header>
  );
}
