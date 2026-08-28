"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { Input } from "@featul/ui/components/input"
import { Label } from "@featul/ui/components/label"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@featul/ui/components/card"
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar"
import { cn } from "@featul/ui/lib/utils"
import TimezonePicker from "./TimezonePicker"
import WizardPreview from "./WizardPreview"
import { CheckIcon } from "@featul/ui/icons/check"
import { XMarkIcon } from "@featul/ui/icons/xmark"
import { LoaderIcon } from "@featul/ui/icons/loader"
import { WebsiteFavicon } from "./WebsiteFavicon"
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
import { WIZARD_STEPS } from "./steps"

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
  isAppCreator?: boolean
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
  isAppCreator = false,
}: StepWizardFormProps) {
  const [step, setStep] = React.useState(0)
  const steps = WIZARD_STEPS
  const current = steps[step]
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
  const nameReserved = !isAppCreator && isReservedWorkspaceName(name)
  const slugReserved = !isAppCreator && isReservedWorkspaceSlug(slug)
  const reservedAllowed = { allowReserved: isAppCreator }

  const canNext = React.useMemo(() => {
    const id = steps[step]?.id
    if (id === "domain") return domain.length > 0 && domainValid
    if (id === "name") return isNameValid(name, reservedAllowed)
    if (id === "slug") return slugLocked ? true : !!slug && isSlugValid(slug, reservedAllowed) && slugAvailable === true
    if (id === "timezone") return isTimezoneValid(timezone)
    return false
  }, [step, steps, domain, domainValid, name, slug, slugAvailable, slugLocked, timezone, isAppCreator])

  const allValid =
    isNameValid(name, reservedAllowed) &&
    isDomainValid(domain) &&
    (slugLocked ? true : isSlugValid(slug, reservedAllowed) && slugAvailable === true) &&
    isTimezoneValid(timezone)

  React.useEffect(() => {
    const stepName = steps[step]?.id
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

      const currentState = formStateRef.current
      const hasStarted = Boolean(
        currentState.domain.trim() || currentState.name.trim() || currentState.slug.trim(),
      )
      if (!hasStarted) return

      captureAnalyticsEvent(analyticsEvents.workspaceSetupAbandoned, {
        last_step: steps[currentState.step]?.id || steps[0].id,
        has_domain: Boolean(currentState.domain.trim()),
        has_name: Boolean(currentState.name.trim()),
        has_slug: Boolean(currentState.slug.trim()),
        has_reserved_slug: Boolean(currentState.slugLocked),
      })
    }
  }, [steps])

  const onNext = React.useCallback(() => {
    if (!canNext || isCreating) return
    const stepName = steps[step]?.id
    if (step < steps.length - 1) {
      captureAnalyticsEvent(analyticsEvents.workspaceSetupStepCompleted, {
        step_name: stepName,
        step_index: step,
        next_step: steps[step + 1]?.id,
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
  }, [step, steps, allValid, isCreating, create, canNext])

  const onBack = React.useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const fieldInputClass = cn(
    toolbarItemClass,
    "h-8 min-w-0 flex-1 px-2.5 text-xs font-medium placeholder:text-accent hover:bg-transparent md:text-sm",
  )
  const suggestedDomain = suggestDomainFix(domain)

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 lg:grid-cols-2">
      <WizardPreview />

      <div className="flex min-h-0 items-center justify-center bg-card px-4 py-8 sm:px-8 dark:bg-card">
        <Card variant="plain" className="w-full max-w-[520px] bg-transparent dark:bg-transparent">
          <CardHeader>
            <div className="mb-2 flex items-center gap-1">
              {steps.map((item, i) => (
                <div
                  key={item.id}
                  className={`h-1 rounded-full ${i <= step ? "bg-foreground" : "bg-foreground/20"}`}
                  style={{ width: i === step ? 32 : 18 }}
                />
              ))}
            </div>
            <CardTitle className="font-heading text-xl">{current.title}</CardTitle>
            <CardDescription className="font-light text-accent">{current.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {current.id === "domain" && (
              <div className="space-y-2">
                <Label htmlFor="domain">Domain</Label>
                <Toolbar size="sm" className="w-full">
                  <span className="inline-flex h-full shrink-0 items-center self-stretch rounded-l-md border-r border-border bg-card px-3 text-xs font-medium tracking-wide text-accent dark:bg-black dark:text-accent">
                    HTTPS
                  </span>
                  <Input
                    id="domain"
                    variant="plain"
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    className={fieldInputClass}
                    autoFocus
                  />
                  {!domainValid && domain.length > 0 ? (
                    <span
                      className={cn(
                        toolbarItemClass,
                        "inline-flex items-center px-2 hover:bg-transparent",
                      )}
                    >
                      <XMarkIcon className="size-4 text-destructive" />
                    </span>
                  ) : null}
                </Toolbar>
                {reservedWorkspaceUrl ? (
                  <p className="text-xs text-accent">
                    Reserved URL{" "}
                    <span className="font-medium text-primary">{reservedWorkspaceUrl}</span> will
                    be used.
                  </p>
                ) : null}
                {!domainValid && domain.length > 0 ? (
                  <div className="flex items-center gap-1 text-xs text-destructive">
                    <span>Invalid domain</span>
                    {suggestedDomain ? (
                      <>
                        <span>— did you mean</span>
                        <button
                          type="button"
                          className="cursor-pointer font-heading text-destructive underline underline-offset-2 transition-opacity hover:opacity-80"
                          onClick={() => setDomain(suggestedDomain)}
                        >
                          {suggestedDomain}
                        </button>
                        ?
                      </>
                    ) : null}
                  </div>
                ) : null}
              </div>
            )}

            {current.id === "name" && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Toolbar size="sm" className="w-full">
                  <Input
                    id="name"
                    variant="plain"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="My workspace"
                    className={fieldInputClass}
                    autoFocus
                    maxLength={15}
                  />
                </Toolbar>
                {nameReserved ? (
                  <p className="text-xs text-destructive">This workspace name is reserved.</p>
                ) : null}
                {reservedWorkspaceUrl ? (
                  <p className="text-xs text-accent">
                    URL is locked to{" "}
                    <span className="font-medium text-primary">{reservedWorkspaceUrl}</span>.
                  </p>
                ) : null}
              </div>
            )}

            {current.id === "slug" && (
              <div className="space-y-2">
                <Label htmlFor="slug" className="flex items-center gap-2">
                  Workspace URL
                  {slugLocked ? (
                    <OverlayChip innerClassName="px-1.5 text-[10px] font-medium">
                      Reserved
                    </OverlayChip>
                  ) : null}
                </Label>
                <Toolbar size="sm" className="w-full">
                  <span
                    className={cn(
                      toolbarItemClass,
                      "inline-flex shrink-0 items-center px-2",
                    )}
                  >
                    <WebsiteFavicon domain={domain} />
                  </span>
                  <Input
                    id="slug"
                    variant="plain"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="project-slug"
                    className={fieldInputClass}
                    disabled={!!slugLocked}
                    autoFocus
                  />
                  <span
                    className={cn(
                      toolbarItemClass,
                      "inline-flex shrink-0 items-center gap-1.5 px-2.5 hover:bg-transparent",
                    )}
                  >
                    {!slugLocked && slugChecking ? (
                      <LoaderIcon className="size-3.5 animate-spin text-accent" />
                    ) : !slugLocked && slug && slugAvailable === true ? (
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white">
                        <CheckIcon className="size-2.5" />
                      </span>
                    ) : !slugLocked &&
                      (slugAvailable === false || (slug && !isSlugValid(slug, reservedAllowed))) ? (
                      <span className="inline-flex size-4 items-center justify-center rounded-full bg-destructive text-white">
                        <XMarkIcon className="size-2.5" />
                      </span>
                    ) : null}
                    <span className="text-xs text-accent">.featul.com</span>
                  </span>
                </Toolbar>
                {slug && !slugReserved && !isSlugValid(slug, reservedAllowed) ? (
                  <p className="text-xs text-destructive">
                    Use lowercase letters only (min 5 chars).
                  </p>
                ) : null}
                {!slugLocked && slugReserved ? (
                  <p className="text-xs text-destructive">This URL is reserved.</p>
                ) : null}
                {!slugLocked && !slugReserved && slugAvailable === false ? (
                  <p className="text-xs text-destructive">This URL is already taken.</p>
                ) : null}
              </div>
            )}

            {current.id === "timezone" && (
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
            <Button type="button" onClick={onNext} disabled={isCreating || !canNext}>
              {isCreating ? (
                <LoaderIcon className="size-4 animate-spin" />
              ) : step === steps.length - 1 ? (
                "Create"
              ) : (
                "Next"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
