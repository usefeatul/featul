"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left"
import { SECTIONS, WORKSPACE_TITLES } from "@/config/sections"
import HeaderActions from "@/components/requests/HeaderActions"

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
  const isMemberDetail = rest[0] === "members" && rest.length > 1

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
        ) : null}
      </div>
    </div>
  )
}
