"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@featul/ui/components/button"
import { Input } from "@featul/ui/components/input"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@featul/ui/components/popover"
import { ChevronDown, Search } from "lucide-react"
import * as ct from "countries-and-timezones"
import { formatTimeWithDate } from "../../lib/time"
import { TimezoneIcon as Timezone } from "@featul/ui/icons/timezone"

export default function TimezonePicker({ value, onChange, now }: { value: string; onChange: (v: string) => void; now: Date }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [mounted, setMounted] = useState(false)
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) {
      setPortalContainer(null)
      return
    }
    const dialog = document.querySelector(
      '[data-slot="dialog-content"][data-state="open"]',
    )
    setPortalContainer(dialog instanceof HTMLElement ? dialog : null)
  }, [open])

  const timezones = useMemo(() => {
    const base = ["UTC", "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "Asia/Tokyo"]
    if (!mounted) {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (detected && !base.includes(detected)) return [detected, ...base]
      return base
    }
    const sup = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : []
    if (sup && sup.length) return sup
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    if (detected && !base.includes(detected)) return [detected, ...base]
    return base
  }, [mounted])

  const timeString = useMemo(() => {
    if (!mounted) return "--:--"
    try {
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: value }).format(now)
    } catch {
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: true }).format(now)
    }
  }, [mounted, value, now])

  const friendlyTZ = (tz: string) => {
    const city = tz.split("/").slice(-1)[0]?.replace(/_/g, " ") ?? tz
    const country = ct.getCountryForTimezone(tz)?.name
    return country ? `${city}, ${country}` : city
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return timezones
    return timezones.filter((t) => t.toLowerCase().includes(q) || friendlyTZ(t).toLowerCase().includes(q))
  }, [query, timezones])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="w-full h-10 justify-between bg-muted/50 border-input font-normal hover:bg-muted/70 px-3"
        >
          <div className="flex items-center gap-2 truncate">
            <Timezone className="size-4 text-muted-foreground shrink-0" />
            <span className="truncate">
              {friendlyTZ(value)}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-muted-foreground bg-muted dark:bg-black px-1.5 py-0.5 rounded-md border" suppressHydrationWarning>{timeString}</span>
            <ChevronDown className="size-4 text-muted-foreground opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="z-[100] w-[calc(100vw-2rem)] sm:w-[450px] p-0"
        align="center"
        list
        container={portalContainer}
        onWheel={(event) => event.stopPropagation()}
      >
        <div className="border-b p-2">
          <div className="mb-1.5 w-fit rounded-sm bg-muted/50 px-1.5 py-1 dark:bg-black">
            <span className="text-xs font-light text-accent" suppressHydrationWarning>
              Your local time - {formatTimeWithDate((typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"), now)}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by city or country..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-9 border-none bg-transparent pl-8 shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
        <PopoverList className="max-h-[300px] touch-pan-y overflow-y-auto overscroll-contain p-0 [-webkit-overflow-scrolling:touch]">
          {filtered.map((tz) => (
            <PopoverListItem
              key={tz}
              as="div"
              onClick={() => {
                onChange(tz)
                setOpen(false)
              }}
              className={`flex cursor-pointer items-center gap-1.5 px-3 py-2.5 text-sm hover:bg-muted/50 ${value === tz ? "text-accent-foreground" : ""}`}
            >
              <span className="font-medium" suppressHydrationWarning>{mounted ? formatTimeWithDate(tz, now) : "--:--"}.</span>
              <span className="truncate text-accent">{friendlyTZ(tz)}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
