"use client"

import React from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Button } from "@featul/ui/components/button"
import { ToolbarSeparator } from "@featul/ui/components/toolbar"
import { Clock } from "lucide-react"
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
import { SNOOZED_STATUS_KEY } from "@featul/api/shared/snooze"

export default function SnoozedFilterAction({
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

  const count = Number(statusCounts?.[SNOOZED_STATUS_KEY] ?? 0)
  const selectedStatuses = React.useMemo(
    () => parseRequestFiltersFromSearchParams(sp).status,
    [sp],
  )
  const isActive =
    selectedStatuses.length === 1 && selectedStatuses[0] === SNOOZED_STATUS_KEY

  const tooltip = isActive
    ? `Clear snoozed filter · ${count}`
    : count > 0
      ? `Snoozed · ${count}`
      : "Snoozed requests"

  const handleClick = () => {
    const href = buildRequestsUrl(slug, sp, {
      status: isActive ? [] : [SNOOZED_STATUS_KEY],
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
            <Clock className="size-4" strokeWidth={2.25} />
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
