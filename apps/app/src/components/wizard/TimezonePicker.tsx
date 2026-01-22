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
  useEffect(() => setMounted(true), [])

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
        <Button type="button" variant="outline" className="w-full h-10 justify-between bg-muted/50 border-input font-normal hover:bg-muted/70 px-3">
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
        className="z-60 w-[calc(100vw-2rem)] sm:w-[450px] p-0"
        align="center"
        list
        container={typeof document !== "undefined" ? (document.querySelector('[data-slot="dialog-content"]') as HTMLElement | null) : undefined}
      >
        <div className="p-2 border-b">
          <div className="w-fit bg-muted/50 dark:bg-black rounded-sm  px-1.5 py-1 mb-1.5">
            <span className="text-xs font-light text-accent" suppressHydrationWarning>
              Your local time - {formatTimeWithDate((typeof window !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC"), now)}
            </span>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search by city or country..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8 h-9 bg-transparent border-none shadow-none focus-visible:ring-0 placeholder:text-muted-foreground/70"
            />
          </div>
        </div>
        <PopoverList className="max-h-[300px] overflow-y-auto p-0">
          {filtered.map((tz) => (
            <PopoverListItem
              key={tz}
              as="div"
              onClick={() => {
                onChange(tz)
                setOpen(false)
              }}
              className={`flex items-center gap-1.5 px-3 py-2.5 cursor-pointer text-sm hover:bg-muted/50 ${value === tz ? "text-accent-foreground" : ""}`}
            >
              <span className="font-medium" suppressHydrationWarning>{mounted ? formatTimeWithDate(tz, now) : "--:--"}.</span>
              <span className="text-accent truncate">{friendlyTZ(tz)}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
