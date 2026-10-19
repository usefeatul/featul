"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";

import { Switch } from "@featul/ui/components/switch";
import { ChevronLeftIcon, Plus } from "@/components/global/icons";
import { SECTIONS, WORKSPACE_TITLES, getSectionMeta } from "@/config/sections";
import { getAccountSectionMeta } from "@/config/account/sections";
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
  workspaceName,
  embeddedInEditor = false,
  editorActions,
  editorTitle,
}: {
  workspaceName: string;
  embeddedInEditor?: boolean;
  editorActions?: EditorAction[];
  editorTitle?: string;
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
  const showHelpEditActions = rest[0] === "help" && rest.length >= 2;
  const showEditorActions = showChangelogEditActions || showHelpEditActions;
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
  const actions = editorActions ?? editorContext?.actions ?? [];
  const hasEmbeddedEditorHeader =
    (rest[0] === "changelog" || rest[0] === "help") &&
    (rest[1] === "new" || rest[2] === "edit");
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
  if (showHelpEditActions) {
    title = rest[1] === "new" ? "New article" : "Edit article";
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
    (isMembersSection && !isMemberDetail);
  const showHeaderUtilityRow =
    showFilterSummary || Boolean(pageActions) || !showPageHeading;

  if (isCompactListHeader) {
    const editorSection = showHelpEditActions
      ? { label: "Help Center", href: `/workspaces/${workspaceSlug}/help`, untitled: "Untitled article" }
      : { label: "Changelog", href: `/workspaces/${workspaceSlug}/changelog`, untitled: "Untitled changelog" };
    const changelogTitle = editorTitle?.trim() || editorSection.untitled;
    return (
      <header className="relative z-40 shrink-0 bg-background px-4 sm:px-6">
        <div className="flex min-h-12 min-w-0 items-center justify-between gap-2 sm:gap-3">
          {embeddedInEditor && showEditorActions ? (
            <nav aria-label={`${editorSection.label} navigation`} className="min-w-0 flex-1">
              <ol className="flex min-w-0 items-center gap-2 text-sm">
                <li className="shrink-0">
                  <Link
                    href={editorSection.href}
                    aria-label={`Back to ${editorSection.label.toLowerCase()}`}
                    className="flex items-center rounded-lg py-1 text-accent transition-colors hover:text-foreground"
                  >
                    {editorSection.label}
                  </Link>
                </li>
                <li aria-hidden="true" className="shrink-0 text-accent/50">
                  /
                </li>
                <li
                  aria-current="page"
                  className="min-w-0 truncate font-medium"
                  title={changelogTitle}
                >
                  {changelogTitle}
                </li>
              </ol>
            </nav>
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
        <Link
          href={`/workspaces/${workspaceSlug}`}
          className="max-w-48 truncate rounded-lg px-1.5 py-1 text-accent transition-colors hover:bg-muted dark:hover:bg-white/5"
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
        {showHeaderUtilityRow ? (
          <div
            className={cn(
              "flex min-h-11 flex-wrap items-center justify-between gap-2 pb-2",
              !showPageHeading && "mb-5",
              (isSettingsSection || isAccountSection) &&
                "mx-auto w-full max-w-4xl",
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
        ) : null}
      </div>
    </header>
  );
}
