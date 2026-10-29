"use client"

import React from "react"
import { Button } from "@featul/ui/components/button"
import { Input, InputGroup } from "@featul/ui/components/input"
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
import TimezonePicker from "./TimezonePicker"
import WizardLivePreview from "./WizardLivePreview"
import { CheckIcon, GitHubIcon, XMarkIcon, LoaderIcon } from "@/components/global/icons";
import { Switch } from "@featul/ui/components/switch"

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
import { ROOT_DOMAIN, workspaceHost } from "@/config/domain"

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
  create: (options?: { helpImport?: { repo: string } | null }) => void | Promise<void>
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
  const [draftHelp, setDraftHelp] = React.useState(true)
  const [repo, setRepo] = React.useState("")
  const repoValid = !repo.trim() || /^(https?:\/\/)?(www\.)?github\.com\/[\w.-]+\/[\w.-]+\/?$|^[\w.-]+\/[\w.-]+$/.test(repo.trim())
  const steps = WIZARD_STEPS
  const current = steps[step] ?? steps[0]
  const viewedStepsRef = React.useRef<Set<string>>(new Set())
  const submittedRef = React.useRef(false)
  const formStateRef = React.useRef({
    domain: "",
    name: "",
    slug: "",
    slugLocked: null as string | null,
    step: 0,
  })
  const reservedWorkspaceUrl = slugLocked ? workspaceHost(slugLocked) : null
  const nameReserved = !isAppCreator && isReservedWorkspaceName(name)
  const slugReserved = !isAppCreator && isReservedWorkspaceSlug(slug)
  const reservedAllowed = React.useMemo(
    () => ({ allowReserved: isAppCreator }),
    [isAppCreator],
  )

  const canNext = React.useMemo(() => {
    const id = steps[step]?.id
    if (id === "domain") return domain.length > 0 && domainValid
    if (id === "name") return isNameValid(name, reservedAllowed)
    if (id === "slug") return slugLocked ? true : !!slug && isSlugValid(slug, reservedAllowed) && slugAvailable === true
    if (id === "timezone") return isTimezoneValid(timezone)
    if (id === "help") return !draftHelp || repoValid
    return false
  }, [step, steps, domain, domainValid, name, slug, slugAvailable, slugLocked, timezone, reservedAllowed, draftHelp, repoValid])

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
      create({ helpImport: draftHelp ? { repo } : null })
    }
  }, [step, steps, allValid, isCreating, create, canNext, draftHelp, repo])

  const onBack = React.useCallback(() => {
    setStep((s) => Math.max(0, s - 1))
  }, [])

  const suggestedDomain = suggestDomainFix(domain)

  return (
    <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden lg:grid-cols-2 lg:gap-4">
      <div className="relative flex min-h-0 items-center justify-center overflow-hidden bg-card px-4 py-6 sm:px-8">
        <Card variant="plain" className="w-full max-w-[520px] bg-transparent dark:bg-transparent">
          <CardHeader>
            <div className="mb-2 flex items-center gap-1">
              {steps.map((item, i) => (
                <div
                  key={item.id}
                  className={`h-1 rounded-lg ${i <= step ? "bg-primary" : "bg-primary/20"}`}
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
                <InputGroup invalid={!domainValid && domain.length > 0}>
                  <WebsiteFavicon domain={domain} className="size-4 shrink-0 rounded-sm" />
                  <Input
                    id="domain"
                    variant="plain"
                    type="text"
                    value={domain}
                    onChange={(e) => setDomain(e.target.value)}
                    placeholder="example.com"
                    aria-invalid={(!domainValid && domain.length > 0) || undefined}
                    autoFocus
                  />
                  {!domainValid && domain.length > 0 ? (
                    <XMarkIcon className="size-4 shrink-0 text-destructive" />
                  ) : null}
                </InputGroup>
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
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="My workspace"
                  className="h-9"
                  aria-invalid={nameReserved || undefined}
                  autoFocus
                  maxLength={15}
                />
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
                <InputGroup>
                  <WebsiteFavicon domain={domain} className="size-4 shrink-0 rounded-sm" />
                  <Input
                    id="slug"
                    variant="plain"
                    value={slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="project-slug"
                    disabled={!!slugLocked}
                    autoFocus
                  />
                  <span className="inline-flex shrink-0 items-center gap-1.5">
                    {!slugLocked && slugChecking ? (
                      <LoaderIcon className="size-3.5 text-accent" />
                    ) : !slugLocked && slug && slugAvailable === true ? (
                      <span className="inline-flex size-3.5 items-center justify-center rounded-lg bg-emerald-500 text-white">
                        <CheckIcon className="size-2" />
                      </span>
                    ) : !slugLocked &&
                      (slugAvailable === false || (slug && !isSlugValid(slug, reservedAllowed))) ? (
                      <span className="inline-flex size-4 items-center justify-center rounded-lg bg-destructive text-white">
                        <XMarkIcon className="size-2.5" />
                      </span>
                    ) : null}
                    <span className="text-xs text-accent">.{ROOT_DOMAIN}</span>
                  </span>
                </InputGroup>
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

            {current.id === "help" && (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="draft-help">Draft help articles for me</Label>
                    <p className="text-xs text-accent">
                      Nothing is published until you review and publish it.
                    </p>
                  </div>
                  <Switch id="draft-help" checked={draftHelp} onCheckedChange={setDraftHelp} />
                </div>

                {draftHelp ? (
                  <>
                    <div className="space-y-2">
                      <Label>Website</Label>
                      <InputGroup className="cursor-default">
                        <WebsiteFavicon domain={domain} className="size-4 shrink-0 rounded-sm" />
                        <span className="min-w-0 flex-1 truncate text-base text-foreground md:text-sm">
                          {domain}
                        </span>
                        <span className="shrink-0 text-xs text-accent">From step 1</span>
                      </InputGroup>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="repo">
                        GitHub repository <span className="font-normal text-accent">(optional)</span>
                      </Label>
                      <InputGroup invalid={!repoValid} className="gap-0">
                        <GitHubIcon className="mr-2.5 size-4 shrink-0" />
                        <span className="shrink-0 text-base text-accent md:text-sm">github.com/</span>
                        <Input
                          id="repo"
                          variant="plain"
                          value={repo}
                          onChange={(e) =>
                            setRepo(e.target.value.trim().replace(/^(https?:\/\/)?(www\.)?github\.com\//i, ""))
                          }
                          placeholder="your-org/your-repo"
                          aria-invalid={!repoValid || undefined}
                          autoFocus
                        />
                        {repo && repoValid ? (
                          <span className="ml-2.5 inline-flex size-3.5 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                            <CheckIcon className="size-2" />
                          </span>
                        ) : null}
                      </InputGroup>
                      {!repoValid ? (
                        <p className="text-xs text-destructive">Use the owner and repo name, like clerk/javascript.</p>
                      ) : (
                        <p className="text-xs text-accent">Public repos only. READMEs and docs make setup guides more accurate.</p>
                      )}
                    </div>

                  </>
                ) : (
                  <p className="text-xs text-accent">
                    No problem. You can draft articles any time from Settings → Help Center.
                  </p>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex items-center justify-between gap-2">
            <Button variant="ghost" size="sm" onClick={onBack} disabled={step === 0 || isCreating}>
              Back
            </Button>
            <Button type="button" onClick={onNext} disabled={isCreating || !canNext}>
              {isCreating ? (
                <LoaderIcon className="size-4" />
              ) : step === steps.length - 1 ? (
                draftHelp ? "Create and draft" : "Create"
              ) : (
                "Next"
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <WizardLivePreview
        step={current.id}
        domain={domain}
        name={name}
        slug={slugLocked ?? slug}
        timezone={timezone}
        now={now}
        draftHelp={draftHelp}
      />
    </div>
  )
}
