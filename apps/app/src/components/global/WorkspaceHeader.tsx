"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { SECTIONS, WORKSPACE_TITLES } from "@/config/sections"
import HeaderActions from "@/components/requests/HeaderActions"
import { Plus, MoreHorizontal } from "lucide-react"
import { useEditorHeaderActionsOptional } from "@/components/changelog/EditorHeaderContext"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover"

function resolveTitle(segment: string): string {
  const s = segment.toLowerCase()
  if (WORKSPACE_TITLES[s]) return WORKSPACE_TITLES[s]
  const found = SECTIONS.find((x) => x.value === s)
  return found ? found.label : ""
}

export default function WorkspaceHeader() {
  const pathname = usePathname() || "/"
  const parts = pathname.split("/").filter(Boolean)
  const idx = parts.indexOf("workspaces")
  const workspaceSlug = idx >= 0 ? parts[idx + 1] : ""
  const rest = idx >= 0 ? parts.slice(idx + 2) : []
  const showRequestsActions = rest.length === 0 || rest[0] === "requests"
  const showChangelogActions = rest[0] === "changelog" && rest.length === 1
  const showChangelogEditActions = rest[0] === "changelog" && rest.length >= 2
  const isMemberDetail = rest[0] === "members" && rest.length > 1
  const editorContext = useEditorHeaderActionsOptional()

  let title = rest.length === 0 ? "Requests" : ""
  if (rest.length > 0) {
    const t = resolveTitle(rest[0] ?? "")
    title = t || ""
  }

  if (!title && !showRequestsActions && !isMemberDetail) return null

  return (
    <div className="mt-4 mb-6.5">
      <div className="flex items-center justify-between">
        {title ? (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{title}</h1>
          </div>
        ) : (
          <div />
        )}
        {isMemberDetail ? (
          <Button asChild variant="nav" size="xs">
            <Link href={`/workspaces/${workspaceSlug}/members`} aria-label="Back to members">
              <ChevronLeftIcon className="size-3 mr-1" />
              <span className="hidden sm:inline">Back</span>
            </Link>
          </Button>
        ) : showRequestsActions ? (
          <HeaderActions />
        ) : showChangelogActions ? (
          <Button asChild variant="nav">
            <Link href={`/workspaces/${workspaceSlug}/changelog/new`}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Link>
          </Button>
        ) : showChangelogEditActions && editorContext && editorContext.actions.length > 0 ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="nav" size="icon-sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" list className="min-w-0 w-fit">
              <PopoverList>
                {editorContext.actions.map((action) => (
                  <PopoverListItem
                    key={action.key}
                    onClick={action.onClick}
                    disabled={action.disabled}
                    className={`gap-2 text-sm ${action.destructive ? "text-destructive" : ""}`}
                  >
                    {action.icon}
                    {action.label}
                  </PopoverListItem>
                ))}
              </PopoverList>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </div>
  )
}
