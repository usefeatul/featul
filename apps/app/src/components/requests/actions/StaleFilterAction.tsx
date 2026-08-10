"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@featul/ui/components/button"
import { ToolbarSeparator } from "@featul/ui/components/toolbar"
import { CalendarIcon } from "@featul/ui/icons/calendar"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@featul/ui/components/tooltip"
import { getSlugFromPath } from "@/config/nav"
import { buildRequestsUrl } from "@/utils/request"
import { parseRequestFiltersFromSearchParams } from "@/utils/request/filters"
import { filterToolbarButtonClass } from "@/utils/filter/toolbar"
import {
  fetchWorkspaceStatusCounts,
  workspaceQueryKeys,
} from "@/lib/workspace/client"
import { STALE_STATUS_KEY } from "@featul/api/shared/stale"

export default function StaleFilterAction({
  className = "",
}: {
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname() || "/"
  const sp = useSearchParams()
  const slug = React.useMemo(() => getSlugFromPath(pathname), [pathname])

  const { data: statusCounts } = useQuery({
    queryKey: workspaceQueryKeys.statusCounts(slug),
    queryFn: () => fetchWorkspaceStatusCounts(slug),
    enabled: !!slug,
    staleTime: 300_000,
    gcTime: 300_000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  })

  const count = Number(statusCounts?.[STALE_STATUS_KEY] ?? 0)
  const selectedStatuses = React.useMemo(
    () => parseRequestFiltersFromSearchParams(sp).status,
    [sp],
  )
  const isActive =
    selectedStatuses.length === 1 && selectedStatuses[0] === STALE_STATUS_KEY

  if (!isActive && count <= 0) return null

  const tooltip = isActive
    ? `Clear stale filter · ${count}`
    : `Stale · ${count}`

  const handleClick = () => {
    const href = buildRequestsUrl(slug, sp, {
      status: isActive ? [] : [STALE_STATUS_KEY],
      page: 1,
    })
    React.startTransition(() => {
      router.push(href, { scroll: false })
    })
  }

  return (
    <>
      <ToolbarSeparator />
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="card"
            size="icon-sm"
            aria-label={tooltip}
            aria-pressed={isActive}
            onClick={handleClick}
            className={filterToolbarButtonClass(isActive, className)}
          >
            <CalendarIcon className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          sideOffset={6}
          className="w-auto whitespace-nowrap px-2 py-1 text-xs"
        >
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </>
  )
}
