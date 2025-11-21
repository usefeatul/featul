"use client"

import { useEffect, useMemo, useState } from "react"
import { Button } from "@feedgot/ui/components/button"
import Progress from "./Progress"
import StepName from "./StepName"
import StepDomain from "./StepDomain"
import StepSlug from "./StepSlug"
import TimezonePicker from "./TimezonePicker"
import RightInfo from "./RightInfo"
import { client } from "@feedgot/api/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function WorkspaceWizard({ className = "" }: { className?: string }) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const total = 4

  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")
  const [slug, setSlug] = useState("")
  const [slugDirty, setSlugDirty] = useState(false)
  const [slugChecking, setSlugChecking] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)

  const [timezone, setTimezone] = useState<string>(
    typeof Intl !== "undefined" && Intl.DateTimeFormat().resolvedOptions().timeZone
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "UTC"
  )
  const [now, setNow] = useState<Date>(new Date())
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (slugDirty) return
    const s = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
    setSlug(s)
  }, [name, slugDirty])

  useEffect(() => {
    if (!slug || slug.length < 5) {
      setSlugAvailable(null)
      return
    }
    setSlugChecking(true)
    setSlugAvailable(null)
    const id = setTimeout(async () => {
      try {
        const res = await client.workspace.checkSlug.$post({ slug })
        const data = await res.json()
        setSlugAvailable(Boolean(data?.available))
      } catch {
        setSlugAvailable(null)
      } finally {
        setSlugChecking(false)
      }
    }, 500)
    return () => clearTimeout(id)
  }, [slug])

  const domainValid = useMemo(() => {
    const v = domain.trim()
    if (!v) return false
    return /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(v)
  }, [domain])

  const canNext = useMemo(() => {
    if (step === 0) return name.trim().length > 0
    if (step === 1) return domainValid
    if (step === 2) return slug.length >= 5 && slugAvailable === true
    if (step === 3) return !!timezone
    return false
  }, [step, name, domainValid, slug, slugAvailable, timezone])

  const next = () => setStep((s) => Math.min(s + 1, total - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const create = async () => {
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
    <section className="flex min-h-screen items-center justify-center bg-background px-6 md:px-10 lg:px-16">
      <div className={`w-full max-w-3xl mx-auto ${className}`}>
        <div className="bg-card rounded-[calc(var(--radius)+.125rem)] border shadow-md overflow-hidden">
          <div className="flex">
            <div className="w-2/5 p-6 border-r flex flex-col">
              <div className="mb-6">
                <Progress step={step} total={total} />
              </div>

              {step === 0 && <StepName name={name} onChange={setName} />}
              {step === 1 && <StepDomain domain={domain} onChange={setDomain} isValid={domainValid} />}
              {step === 2 && (
                <StepSlug
                  slug={slug}
                  onChange={(v) => {
                    setSlugDirty(true)
                    const clean = v.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/-+/g, "-")
                    setSlug(clean)
                  }}
                  checking={slugChecking}
                  available={slugAvailable}
                />
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-semibold">Select your timezone.</h2>
                    <p className="text-sm text-accent">We’ll use this to align dates and charts.</p>
                  </div>
                  <TimezonePicker value={timezone} onChange={setTimezone} now={now} />
                  <p className="text-[12px] text-accent">All project graphs, ranges and timestamps will be matched to this timezone. Can be updated later.</p>
                </div>
              )}

              <div className="mt-auto pt-6 flex items-center gap-3">
                <Button type="button" variant="outline" onClick={prev} disabled={step === 0}>
                  ←
                </Button>
                {step < total - 1 ? (
                  <Button type="button" onClick={next} disabled={!canNext}>
                    Next →
                  </Button>
                ) : (
                  <Button type="button" onClick={create} disabled={!canNext || isCreating}>
                    {isCreating ? "Creating..." : "Create project →"}
                  </Button>
                )}
              </div>
            </div>

            <div className="w-3/5 p-6 flex items-center justify-center bg-muted">
              <RightInfo />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}