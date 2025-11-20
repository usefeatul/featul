"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@feedgot/ui/components/button"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"
import { Popover, PopoverContent, PopoverTrigger } from "@feedgot/ui/components/popover"
import { Globe2, ChevronDown } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { LoadingButton } from "@/components/loading-button"
import { client } from "@feedgot/api/client"

type Props = { className?: string }

export default function CreateProjectForm({ className = "" }: Props) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [slug, setSlug] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [timezone, setTimezone] = useState<string>(
    typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"
  )
  const [now, setNow] = useState<Date>(new Date())
  const [tzOpen, setTzOpen] = useState(false)
  const [tzQuery, setTzQuery] = useState("")

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
    const sup = typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : []
    if (sup && sup.length) return sup
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

  useEffect(() => {
    const s = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    setSlug(s)
  }, [name])

  const formatTime = (tz: string) =>
    new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", hour12: true, timeZone: tz }).format(now)

  const friendlyTZ = (tz: string) => tz.split("/").slice(-1)[0].replace(/_/g, " ")

  const filteredTZs = useMemo(() => {
    const q = tzQuery.trim().toLowerCase()
    if (!q) return timezones
    return timezones.filter((t) => t.toLowerCase().includes(q) || friendlyTZ(t).toLowerCase().includes(q))
  }, [tzQuery, timezones])

  const handleCreate = async () => {
    setIsCreating(true)
    try {
      const res = await client.workspace.create.$post({
        name: name.trim(),
        domain: domain.trim(),
        slug: slug.trim(),
        timezone,
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err?.message || "Failed to create workspace")
        return
      }
      const data = await res.json()
      toast.success("Workspace created")
      const createdSlug = data?.workspace?.slug || slug
      router.push(`/workspaces/${createdSlug}`)
    } catch (e: any) {
      toast.error(e?.message || "Failed to create workspace")
    } finally {
      setIsCreating(false)
    }
  }

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
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent">https://</span>
                  <Input id="domain" type="text" value={domain} onChange={(e) => setDomain(e.target.value)} placeholder="mywebsite.com" className="pl-16" />
                </div>
              </div>

              {/* Slug is derived from name; hidden in UI. */}

              <div className="space-y-2">
                <Label className="block text-sm">Timezone</Label>
                <Popover open={tzOpen} onOpenChange={setTzOpen}>
                  <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-start gap-2">
                      <Globe2 className="size-4" />
                      <span className="truncate">{friendlyTZ(timezone)}</span>
                      <span className="ml-auto text-xs px-2 py-1 rounded-md border bg-muted">{timeString}</span>
                      <ChevronDown className="size-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0 w-[360px]">
                    <div className="text-xs text-accent border-b px-3 py-2">Your local time - {timeString}, {now.toLocaleDateString()}</div>
                    <div className="p-2">
                      <Input placeholder="Search by city or country..." value={tzQuery} onChange={(e) => setTzQuery(e.target.value)} />
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {filteredTZs.map((tz) => (
                        <button
                          key={tz}
                          type="button"
                          onClick={() => {
                            setTimezone(tz)
                            setTzOpen(false)
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-muted flex items-center gap-2"
                        >
                          <span className="flex-1 truncate">{tz}</span>
                          <span className="text-xs">{formatTime(tz)}</span>
                        </button>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
                <p className="text-[12px] text-accent">All project graphs, ranges and timestamps will be matched to this timezone. Can be updated later.</p>
              </div>

              <LoadingButton className="w-full" type="button" loading={isCreating} onClick={handleCreate}>Create workspace</LoadingButton>
            </div>
          </div>
          <div className="p-3">
            <p className="text-accent text-center text-sm">
              Already have a project?
              <Button asChild variant="link" className="px-2 ml-2">
                <Link href="/workspace/new">Go to setup</Link>
              </Button>
            </p>
          </div>
        </form>
      </div>
    </section>
  )
}
