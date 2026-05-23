"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@featul/ui/components/button";
import { Toolbar, ToolbarSeparator } from "@featul/ui/components/toolbar";

import { Switch } from "@featul/ui/components/switch";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import { SECTIONS, WORKSPACE_TITLES } from "@/config/sections";
import HeaderActions from "@/components/requests/HeaderActions";
import FilterSummary from "@/components/requests/FilterSummary";
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
  const showChangelogActions = rest[0] === "changelog" && rest.length === 1;
  const showChangelogEditActions = rest[0] === "changelog" && rest.length >= 2;
  const isMemberDetail = rest[0] === "members" && rest.length > 1;
  const editorContext = useEditorHeaderActionsOptional();

  let title = rest.length === 0 ? "Requests" : "";
  if (rest.length > 0) {
    const t = resolveTitle(rest[0] ?? "");
    title = t || "";
  }

  if (!title && !showRequestsActions && !isMemberDetail) return null;

  const innerClassName = isMemberDetail
    ? "mx-auto flex min-h-7 w-full max-w-[64rem] flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
    : showRequestsActions
      ? "flex min-h-7 w-full items-center justify-between gap-3"
      : "flex min-h-7 w-full items-center justify-end";
  const wrapperClassName = showRequestsActions
    ? "px-0 pb-2"
    : "px-3 pb-2 sm:px-5 lg:px-6";

  return (
    <div className={wrapperClassName}>
      <div className={innerClassName}>
        {isMemberDetail ? <div /> : null}
        {isMemberDetail ? (
          <Toolbar size="sm">
            <Button
              asChild
              variant="card"
              className="h-full rounded-none border-none hover:bg-muted px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
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
          <>
            <FilterSummary className="min-w-0 flex-1 pr-3" />
            <HeaderActions className="shrink-0" />
          </>
        ) : showChangelogActions ? (
          <Toolbar size="sm">
            <ImportNotraDialog workspaceSlug={workspaceSlug} />
            <ToolbarSeparator />
            <Button
              asChild
              variant="card"
              className="h-full rounded-none border-none hover:bg-muted px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
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
          <div className="flex items-center gap-0 overflow-hidden rounded-md bg-card dark:bg-transparent">
            {editorContext.actions
              .filter((action) => action.type === "switch")
              .map((action) => (
                <div
                  key={action.key}
                  className="flex items-center gap-2 px-3 h-8 bg-transparent hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium text-muted-foreground">
                    {action.label}
                  </span>
                  <Switch
                    checked={action.checked}
                    onCheckedChange={action.onClick}
                  />
                </div>
              ))}

            {editorContext.actions
              .filter((action) => action.type === "button")
              .map((action) => (
                <Button
                  key={action.key}
                  variant="ghost"
                  size="xs"
                  onClick={action.onClick}
                  disabled={action.disabled}
                  className="gap-2 h-8 rounded-none hover:bg-muted/50 px-3"
                >
                  {action.label}
                  {action.icon}
                </Button>
              ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
