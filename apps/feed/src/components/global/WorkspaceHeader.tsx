"use client"

import { usePathname } from "next/navigation"
import { SECTIONS, WORKSPACE_TITLES } from "@/config/sections"
import HeaderActions from "@/components/requests/HeaderActions"
import FilterSummary from "@/components/requests/FilterSummary"

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
  const rest = idx >= 0 ? parts.slice(idx + 2) : []
  const show = rest.length === 0 || rest[0] === "requests"

  let title = rest.length === 0 ? "Requests" : ""
  if (rest.length > 0) {
    const t = resolveTitle(rest[0] ?? "")
    title = t || ""
  }

  if (!title && !show) return null

  return (
    <div className="mt-4 mb-5.5">
      <div className="flex items-center justify-between">
        {title ? (
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">{title}</h1>
            {show ? <FilterSummary /> : null}
          </div>
        ) : (
          <div />
        )}
        {show ? <HeaderActions /> : null}
      </div>
    </div>
  )
}
