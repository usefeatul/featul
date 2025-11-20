"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@feedgot/ui/components/button"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"
import Link from "next/link"

type Props = { className?: string }

export default function CreateProjectForm({ className = "" }: Props) {
  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [timezone, setTimezone] = useState<string>(
    typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"
  )
  const [now, setNow] = useState<Date>(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const timeString = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZone: timezone,
      }).format(now)
    } catch {
      return new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }).format(now)
    }
  }, [timezone, now])

  const timezones = useMemo(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    const base = [
      "UTC",
      "Europe/London",
      "Europe/Paris",
      "America/New_York",
      "America/Los_Angeles",
      "Asia/Tokyo",
    ]
    if (detected && !base.includes(detected)) return [detected, ...base]
    return base
  }, [])

  return (
    <section className="flex min-h-screen bg-background">
      <div className={`w-full max-w-sm m-auto md:translate-x-[8%] lg:translate-x-[12%] ${className}`}>
        <form
          action="#"
          className="bg-muted h-fit w-full max-w-sm overflow-hidden rounded-[calc(var(--radius)+.125rem)] border shadow-md shadow-zinc-950/5 dark:[--color-muted:var(--color-zinc-900)]"
        >
          <div className="bg-card -m-px rounded-[calc(var(--radius)+.125rem)] border p-8 pb-6">
            <div className="text-left">
              <h1 className="mb-2 mt-4 text-xl font-semibold">Create new project</h1>
              <p className="text-sm text-accent mb-2">Tell us a bit about the website you want to track</p>
            </div>

            <div className="mt-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="block text-sm">Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Mywebsite" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain" className="block text-sm">Domain</Label>
                <Input id="domain" type="url" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="https://mywebsite.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone" className="block text-sm">Timezone</Label>
                <div className="flex items-center gap-2">
                  <select
                    id="timezone"
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="flex-1 rounded-md border bg-background px-3 py-2 text-sm"
                  >
                    {timezones.map((tz) => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                  <span className="text-xs text-accent px-2 py-1 rounded-md border bg-muted">{timeString}</span>
                </div>
                <p className="text-[12px] text-accent">All project graphs, ranges and timestamps will be matched to this timezone. Can be updated later.</p>
              </div>

              <Button className="w-full" type="button">Create project</Button>
            </div>
          </div>
          <div className="p-3">
            <p className="text-accent text-center text-sm">
              Already have a project?
              <Button asChild variant="link" className="px-2 ml-2">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}