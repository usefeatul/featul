"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import { Toolbar, ToolbarSeparator, toolbarItemClass } from "@featul/ui/components/toolbar";

import { Switch } from "@featul/ui/components/switch";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { SECTIONS, WORKSPACE_TITLES, getSectionMeta } from "@/config/sections";
import HeaderActions from "@/components/requests/HeaderActions";
import FilterDynamicIsland from "@/components/requests/FilterDynamicIsland";
import RoadmapHeaderActions from "@/components/roadmap/RoadmapHeaderActions";
import WorkspaceNotificationsAction from "@/components/global/WorkspaceNotificationsAction";
import { Plus } from "lucide-react";
import { useEditorHeaderActionsOptional } from "@/components/changelog/EditorHeaderContext";
import ImportNotraDialog from "@/components/changelog/ImportNotraDialog";

function resolveTitle(segment: string): string {
  const s = segment.toLowerCase();
  if (WORKSPACE_TITLES[s]) return WORKSPACE_TITLES[s];
  const found = SECTIONS.find((x) => x.value === s);
  return found ? found.label : "";
}

export default function WorkspaceHeader() {
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
  const isChangelogSection = rest[0] === "changelog";
  const isSettingsSection = rest[0] === "settings";
  const settingsMeta = isSettingsSection
    ? getSectionMeta(rest[1] || "branding")
    : null;
  const editorContext = useEditorHeaderActionsOptional();

  let title = rest.length === 0 ? "Requests" : "";
  if (isSettingsSection) {
    title = settingsMeta?.label || "Settings";
  } else if (rest.length > 0) {
    const t = resolveTitle(rest[0] ?? "");
    title = t || "";
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
    <Toolbar size="sm">
      <ImportNotraDialog workspaceSlug={workspaceSlug} />
      <ToolbarSeparator />
      <Button
        asChild
        variant="plain"
        className={`${toolbarItemClass} px-3 text-xs font-medium text-muted-foreground hover:text-foreground`}
      >
        <Link href={`/workspaces/${workspaceSlug}/changelog/new`}>
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Link>
      </Button>
    </Toolbar>
  ) : showChangelogEditActions &&
    editorContext &&
    editorContext.actions.length > 0 ? (
    <Toolbar size="sm">
      {editorContext.actions
        .filter((action) => action.type === "switch")
        .map((action) => (
          <div
            key={action.key}
            className="flex h-full items-center gap-2 px-3 text-sm font-medium text-muted-foreground"
          >
            <span>{action.label}</span>
            <Switch
              checked={action.checked}
              onCheckedChange={action.onClick}
            />
          </div>
        ))}
      {editorContext.actions.some((action) => action.type === "switch") &&
      editorContext.actions.some((action) => action.type === "button") ? (
        <ToolbarSeparator />
      ) : null}
      {editorContext.actions
        .filter((action) => action.type === "button")
        .flatMap((action, index) => [
          index > 0 ? (
            <ToolbarSeparator key={`sep-${action.key}`} />
          ) : null,
          <Button
            key={action.key}
            variant="plain"
            size="xs"
            onClick={action.onClick}
            disabled={action.disabled}
            className={`${toolbarItemClass} gap-2 px-3`}
          >
            {action.label}
            {action.icon}
          </Button>,
        ])}
    </Toolbar>
  ) : title && !isMembersSection && !isChangelogSection ? (
    <Toolbar size="sm">
      <WorkspaceNotificationsAction />
    </Toolbar>
  ) : null;

  if (!title && !pageActions) return null;

  return (
    <>
      {showRequestsActions || showRoadmapActions ? <FilterDynamicIsland /> : null}
      <div className="mt-4 mb-6.5">
        <div className="flex items-center justify-between gap-3">
          {title ? (
            <div className="min-w-0">
              <h1 className="text-xl font-heading leading-tight font-semibold truncate">
                {title}
              </h1>
              {settingsMeta?.desc ? (
                <p className="mt-1 text-sm text-accent">{settingsMeta.desc}</p>
              ) : null}
            </div>
          ) : (
            <div />
          )}
          {pageActions}
        </div>
      </div>
    </>
  );
}
