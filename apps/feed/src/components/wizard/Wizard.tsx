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
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { workspaceSchema, isNameValid, isDomainValid, isSlugValid, isTimezoneValid, cleanSlug, slugifyFromName } from "../../lib/validators"

export default function WorkspaceWizard({ className = "" }: { className?: string }) {
  const router = useRouter()
  const queryClient = useQueryClient()
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
    const s = slugifyFromName(name)
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

  const domainValid = useMemo(() => isDomainValid(domain), [domain])

  const canNext = useMemo(() => {
    if (step === 0) return isNameValid(name)
    if (step === 1) return domainValid
    if (step === 2) return isSlugValid(slug) && slugAvailable === true
    if (step === 3) return isTimezoneValid(timezone)
    return false
  }, [step, name, domainValid, slug, slugAvailable, timezone])

  const next = () => setStep((s) => Math.min(s + 1, total - 1))
  const prev = () => setStep((s) => Math.max(s - 1, 0))

  const create = async () => {
    setIsCreating(true)
    try {
      const parsed = workspaceSchema.safeParse({
        name: name.trim(),
        domain: domain.trim(),
        slug: slug.trim(),
        timezone,
      })
      if (!parsed.success) {
        toast.error("Invalid workspace details")
        return
      }
      const res = await client.workspace.create.$post(parsed.data)
      if (!res.ok) {
        await res.json()
        toast.error("Failed to create workspace")
        return
      }
      const data = await res.json()
      toast.success("Workspace created")
      const createdSlug = data?.workspace?.slug || slug
      try {
        queryClient.setQueryData(["workspaces"], (prev: any) => {
          const list = Array.isArray(prev) ? prev : prev?.workspaces || []
          const next = [...list, data?.workspace].filter(Boolean)
          return prev && prev.workspaces ? { ...prev, workspaces: next } : next
        })
        if (data?.workspace) {
          queryClient.setQueryData(["workspace", createdSlug], data.workspace)
        }
      } catch {}
      router.push(`/workspaces/${createdSlug}`)
    } catch (e: unknown) {
      toast.error((e as { message?: string })?.message || "Failed to create workspace")
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-6 md:px-10 lg:px-16">
      <div className={`w-full max-w-3xl mx-auto ${className}`}>
        <div className="bg-card rounded-[calc(var(--radius)+.125rem)] border shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="w-full md:w-2/5 p-4 sm:p-6 md:border-r border-b md:border-b-0 flex flex-col">
              <div className="mb-6 sm:mb-10">
                <Progress step={step} total={total} />
              </div>

              {step === 0 && <StepName name={name} onChange={setName} isValid={isNameValid(name)} />}
              {step === 1 && <StepDomain domain={domain} onChange={setDomain} isValid={domainValid} />}
              {step === 2 && (
                <StepSlug
                  slug={slug}
                  onChange={(v) => {
                    setSlugDirty(true)
                    setSlug(cleanSlug(v))
                  }}
                  checking={slugChecking}
                  available={slugAvailable}
                />
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg sm:text-xl font-semibold">Select your timezone.</h2>
                    <p className="text-xs sm:text-sm text-accent">We’ll use this to align dates and charts.</p>
                  </div>
                  <TimezonePicker value={timezone} onChange={setTimezone} now={now} />
                  {!isTimezoneValid(timezone) ? (
                    <p className="text-xs text-destructive">Please select a valid timezone.</p>
                  ) : null}
                  <p className="text-[12px] text-accent">All project graphs, ranges and timestamps will be matched to this timezone. Can be updated later.</p>
                </div>
              )}

              <div className="mt-auto pt-6 flex items-center gap-3">
                <Button type="button" variant="quiet" onClick={prev} disabled={step === 0}>
                  ←
                </Button>
                {step < total - 1 ? (
                  <Button type="button" variant="quiet" onClick={next} disabled={!canNext}>
                    Next →
                  </Button>
                ) : (
                  <Button type="button" variant="quiet" onClick={create} disabled={!canNext || isCreating}>
                    {isCreating ? "Creating..." : "Create project →"}
                  </Button>
                )}
              </div>
            </div>

            <div className="w-full md:w-3/5 p-4 sm:p-6 flex items-center justify-center bg-muted/70">
              <RightInfo />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
