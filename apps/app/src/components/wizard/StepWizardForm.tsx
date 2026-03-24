"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { Input } from "@featul/ui/components/input"
import { Label } from "@featul/ui/components/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@featul/ui/components/card"
import TimezonePicker from "./TimezonePicker"
import { ArrowRight, AlertCircle, Link2 } from "lucide-react"
import CheckIcon from "@featul/ui/icons/check"
import XMarkIcon from "@featul/ui/icons/xmark"
import LoaderIcon from "@featul/ui/icons/loader"
import {
  isNameValid,
  isDomainValid,
  isSlugValid,
  isTimezoneValid,
  suggestDomainFix,
  isReservedWorkspaceName,
  isReservedWorkspaceSlug,
} from "../../lib/validators"
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog"

interface StepWizardFormProps {
  name: string
  setName: (v: string) => void
  domain: string
  setDomain: (v: string) => void
  slug: string
  handleSlugChange: (v: string) => void
  slugChecking: boolean
  slugAvailable: boolean | null
  slugLocked: string | null
  timezone: string
  setTimezone: (v: string) => void
  now: Date
  isCreating: boolean
  domainValid: boolean
  create: () => void | Promise<void>
}

export default function StepWizardForm({
  name,
  setName,
  domain,
  setDomain,
  slug,
  handleSlugChange,
  slugChecking,
  slugAvailable,
  slugLocked,
  timezone,
  setTimezone,
  now,
  isCreating,
  domainValid,
  create,
}: StepWizardFormProps) {
  const [step, setStep] = React.useState(0)
  const steps = React.useMemo(() => ["domain", "name", "slug", "timezone"], [])
  const viewedStepsRef = React.useRef<Set<string>>(new Set())
  const submittedRef = React.useRef(false)
  const formStateRef = React.useRef({
    domain: "",
    name: "",
    slug: "",
    slugLocked: null as string | null,
    step: 0,
  })
  const reservedWorkspaceUrl = slugLocked ? `${slugLocked}.featul.com` : null
  const nameReserved = isReservedWorkspaceName(name)
  const slugReserved = isReservedWorkspaceSlug(slug)

  const canNext = React.useMemo(() => {
    if (step === 0) return domain.length > 0 && domainValid
    if (step === 1) return isNameValid(name)
    if (step === 2) return slugLocked ? true : !!slug && isSlugValid(slug) && slugAvailable === true
    if (step === 3) return isTimezoneValid(timezone)
    return false
  }, [step, domain, domainValid, name, slug, slugAvailable, slugLocked, timezone])

  const allValid =
    isNameValid(name) &&
    isDomainValid(domain) &&
    (slugLocked ? true : isSlugValid(slug) && slugAvailable === true) &&
    isTimezoneValid(timezone)

  React.useEffect(() => {
    const stepName = steps[step]
    if (!stepName || viewedStepsRef.current.has(stepName)) return

    viewedStepsRef.current.add(stepName)
    captureAnalyticsEvent(analyticsEvents.workspaceSetupStepViewed, {
      step_name: stepName,
      step_index: step,
      has_reserved_slug: Boolean(slugLocked),
    })
  }, [step, steps, slugLocked])

  React.useEffect(() => {
    formStateRef.current = {
      domain,
      name,
      slug,
      slugLocked,
      step,
    }
  }, [domain, name, slug, slugLocked, step])

  React.useEffect(() => {
    return () => {
      if (submittedRef.current) return

      const current = formStateRef.current
      const hasStarted = Boolean(
        current.domain.trim() || current.name.trim() || current.slug.trim(),
      )
      if (!hasStarted) return

      captureAnalyticsEvent(analyticsEvents.workspaceSetupAbandoned, {
        last_step: steps[current.step] || steps[0],
        has_domain: Boolean(current.domain.trim()),
        has_name: Boolean(current.name.trim()),
        has_slug: Boolean(current.slug.trim()),
        has_reserved_slug: Boolean(current.slugLocked),
      })
    }
  }, [steps])

  const onNext = React.useCallback(() => {
    const stepName = steps[step]
    if (step < steps.length - 1) {
      captureAnalyticsEvent(analyticsEvents.workspaceSetupStepCompleted, {
        step_name: stepName,
        step_index: step,
        next_step: steps[step + 1],
      })
      setStep((s) => s + 1)
      return
    }
    if (allValid && !isCreating) {
      submittedRef.current = true
      captureAnalyticsEvent(analyticsEvents.workspaceSetupStepCompleted, {
        step_name: stepName,
        step_index: step,
        next_step: "workspace_created",
      })
      create()
    }
  }, [step, steps, allValid, isCreating, create])

  const onBack = React.useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const title = React.useMemo(() => {
    if (step === 0) return "First things first."
    if (step === 1) return "Name your workspace."
    if (step === 2) return "Choose your workspace URL."
    return "Pick a timezone."
  }, [step])

  const description = React.useMemo(() => {
    if (step === 0) return "Which website do you want to collect feedback for?"
    if (step === 1) return "A clear name helps your team recognize it."
    if (step === 2) return "Used for sharing and navigation; must be unique."
    return "All timestamps and charts will align to this timezone."
  }, [step])

  return (
    <Card variant="plain" className="w-full max-w-[520px] mx-auto">
      <CardHeader>
        <div className="flex items-center gap-1 mb-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full ${i <= step ? "bg-foreground" : "bg-muted"}`}
              style={{ width: i === step ? 32 : 18 }}
            />
          ))}
        </div>
        <CardTitle className="font-heading text-xl">{title}</CardTitle>
        <CardDescription className="text-accent font-light">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 0 && (
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <div className="relative flex items-center">
              <span className="inline-flex items-center h-10 px-3 bg-muted border rounded-l-md text-muted-foreground/80 select-none text-sm border-r-0">
                https://
              </span>
              <Input
                id="domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
                className="h-10 flex-1 rounded-l-none bg-muted/50 placeholder:text-accent"
                autoFocus
              />
              {!domainValid && domain.length > 0 && (
                <AlertCircle className="absolute right-3 size-4 text-destructive" />
              )}
            </div>
            {reservedWorkspaceUrl && (
              <p className="mt-1.5 text-xs text-accent">
                Reserved URL <span className="font-medium text-primary">{reservedWorkspaceUrl}</span> will be used.
              </p>
            )}
            {!domainValid && domain.length > 0 && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-destructive">
                <span>Invalid domain</span>
                {(() => {
                  const suggested = suggestDomainFix(domain)
                  if (!suggested) return null
                  return (
                    <>
                      <span>— did you mean</span>
                      <button
                        type="button"
                        className="cursor-pointer font-heading text-destructive underline underline-offset-2 transition-opacity hover:opacity-80"
                        onClick={() => setDomain(suggested)}
                      >
                        {suggested}
                      </button>
                      ?
                    </>
                  )
                })()}
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My workspace"
              className="h-10 bg-muted/50 placeholder:text-accent"
              autoFocus
              maxLength={15}
            />
            {nameReserved && (
              <p className="text-xs text-destructive">
                This workspace name is reserved.
              </p>
            )}
            {reservedWorkspaceUrl && (
              <p className="mt-1.5 text-xs text-accent">
                URL is locked to <span className="font-medium text-primary">{reservedWorkspaceUrl}</span>.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-2">
              Workspace URL
              {slugLocked && (
                <span className="text-xs bg-primary px-1 py-0.5 rounded-sm text-primary-foreground font-normal border border-border ">
                  Reserved
                </span>
              )}
            </Label>
            <div className="relative">
              <Input
                id="slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="project-slug"
                className="h-auto py-2.5 pl-9 pr-24 bg-muted/50 placeholder:text-accent text-sm leading-5"
                disabled={!!slugLocked}
                autoFocus
              />
              <div className="absolute left-3 top-0 bottom-0 flex items-center justify-center pointer-events-none mt-0.5">
                <Link2 className="size-4 text-muted-foreground" />
              </div>
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                .featul.com
              </span>
              <div className="absolute right-[6rem] top-1/2 -translate-y-1/2">
                {slugChecking ? (
                  <LoaderIcon className="size-4 text-muted-foreground animate-spin" />
                ) : !slugLocked && slug && slugAvailable === true ? (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500 text-white">
                    <CheckIcon className="size-2.5" />
                  </span>
                ) : !slugLocked &&
                  (slugAvailable === false || (slug && !isSlugValid(slug))) ? (
                  <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-destructive text-destructive-foreground">
                    <XMarkIcon className="size-2.5" />
                  </span>
                ) : null}
              </div>
            </div>
            {slug && !slugReserved && !isSlugValid(slug) && (
              <p className="text-xs text-destructive">
                Use lowercase letters only (min 5 chars).
              </p>
            )}
            {!slugLocked && slugReserved && (
              <p className="text-xs text-destructive">This URL is reserved.</p>
            )}
            {!slugLocked && !slugReserved && slugAvailable === false && (
              <p className="text-xs text-destructive">
                This URL is already taken.
              </p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <Label>Timezone</Label>
            <TimezonePicker value={timezone} onChange={setTimezone} now={now} />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={step === 0 || isCreating}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onNext}
          disabled={isCreating || (!canNext && step !== steps.length - 1) || (step === steps.length - 1 && !allValid)}

        >
          {isCreating ? (
            <>
              <LoaderIcon className="mr-2 size-4 animate-spin" />
            </>
          ) : step === steps.length - 1 ? (
            "Create"
          ) : (
            "Next"
          )}
          {!isCreating && step !== steps.length - 1 && <ArrowRight className="size-4 opacity-50" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
