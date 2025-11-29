"use client"

import { useMemo, useState } from "react"
import { Button } from "@feedgot/ui/components/button"
import { Input } from "@feedgot/ui/components/input"
import { Popover, PopoverContent, PopoverTrigger, PopoverList, PopoverListItem } from "@feedgot/ui/components/popover"
import { Globe2, ChevronDown } from "lucide-react"

export default function TimezonePicker({ value, onChange, now }: { value: string; onChange: (v: string) => void; now: Date }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const timezones = useMemo(() => {
    const sup = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : []
    if (sup && sup.length) return sup
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    const base = ["UTC", "Europe/London", "Europe/Paris", "America/New_York", "America/Los_Angeles", "Asia/Tokyo"]
    if (detected && !base.includes(detected)) return [detected, ...base]
    return base
  }, [])

  const timeString = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: value }).format(now)
    } catch {
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: true }).format(now)
    }
  }, [value, now])
  const friendlyTZ = (tz: string) => tz.split("/").slice(-1)[0]?.replace(/_/g, " ") ?? tz
  const formatTimeWithDate = (tz: string) => {
    const t = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: tz }).format(now)
    const d = new Intl.DateTimeFormat(undefined, { month: "short", day: "2-digit", timeZone: tz }).format(now)
    return `${t}, ${d}`
  }
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return timezones
    return timezones.filter((t) => t.toLowerCase().includes(q) || friendlyTZ(t).toLowerCase().includes(q))
  }, [query, timezones])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="ghost" className="w-full justify-start gap-2">
          <Globe2 className="size-4" />
          <span className="truncate">{friendlyTZ(value)}</span>
          <span className="ml-auto text-xs px-2 py-1 rounded-md border bg-muted">{timeString}</span>
          <ChevronDown className="size-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent list className="w-[calc(100vw-2rem)] sm:w-[400px]">
        <div className="p-2">
          <Input placeholder="Search by city or country..." value={query} onChange={(e) => setQuery(e.target.value)} className="placeholder:text-accent/70" />
        </div>
        <PopoverList>
          {filtered.map((tz) => (
            <PopoverListItem
              key={tz}
              onClick={() => {
                onChange(tz)
                setOpen(false)
              }}
            >
              <span className="text-sm">{formatTimeWithDate(tz)}</span>
              <span className="ml-auto text-sm text-accent truncate">{friendlyTZ(tz)}</span>
            </PopoverListItem>
          ))}
        </PopoverList>
      </PopoverContent>
    </Popover>
  )
}
