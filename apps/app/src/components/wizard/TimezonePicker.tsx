"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverContent, PopoverTrigger } from "@featul/ui/components/popover"
import { DropdownIcon } from "@featul/ui/icons/dropdown"
import { TimezoneIcon as Timezone } from "@featul/ui/icons/timezone"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import { SidebarBadge } from "@/components/sidebar/badge"
import { formatTime12h } from "@/lib/time"
import { friendlyTimezone } from "@/lib/timezone"
import { TimezoneSelectPanel } from "./TimezoneSelectPanel"

export default function TimezonePicker({
  value,
  onChange,
  now,
}: {
  value: string
  onChange: (v: string) => void
  now: Date
}) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const timeString = useMemo(() => {
    if (!mounted) return "--:--"
    return formatTime12h(value, now) || formatTime12h("UTC", now)
  }, [mounted, value, now])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Toolbar size="sm" className="w-full">
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="plain"
            className={cn(
              toolbarItemClass,
              "h-8 w-full cursor-pointer justify-between gap-2 px-2.5 text-xs font-medium",
            )}
          >
            <span className="flex min-w-0 items-center gap-2 truncate">
              <Timezone className="size-4 shrink-0 text-accent" />
              <span className="truncate">{friendlyTimezone(value)}</span>
            </span>
            <span className="flex shrink-0 items-center gap-1.5">
              <SidebarBadge
                className="shrink-0"
                fixedWidth={false}
                innerClassName="px-1.5 tabular-nums"
              >
                <span suppressHydrationWarning>{timeString}</span>
              </SidebarBadge>
              <DropdownIcon className="size-3" />
            </span>
          </Button>
        </PopoverTrigger>
      </Toolbar>
      <PopoverContent
        className="z-[100] w-[calc(100vw-2rem)] p-0 sm:w-[450px]"
        align="center"
        unstyled
        onWheel={(event) => event.stopPropagation()}
      >
        <TimezoneSelectPanel
          className="max-h-[min(70dvh,420px)]"
          value={value}
          now={now}
          onChange={(tz) => {
            onChange(tz)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
