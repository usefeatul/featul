"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@featul/ui/components/button"
import { Popover, PopoverContent, PopoverTrigger } from "@featul/ui/components/popover"
import { ChevronDown } from "lucide-react"
import { TimezoneIcon as Timezone } from "@featul/ui/icons/timezone"
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
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: value,
      }).format(now)
    } catch {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(now)
    }
  }, [mounted, value, now])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-10 w-full justify-between bg-muted/50 border-input px-3 font-normal hover:bg-muted/70"
        >
          <div className="flex min-w-0 items-center gap-2 truncate">
            <Timezone className="size-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{friendlyTimezone(value)}</span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className="rounded-md border bg-muted px-1.5 py-0.5 text-xs text-muted-foreground dark:bg-black"
              suppressHydrationWarning
            >
              {timeString}
            </span>
            <ChevronDown className="size-4 text-muted-foreground opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] w-[calc(100vw-2rem)] p-0 sm:w-[450px]"
        align="center"
        unstyled
        onWheel={(event) => event.stopPropagation()}
      >
        <TimezoneSelectPanel
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
