"use client"

import React from "react"
import { Button } from "@oreilla/ui/components/button"
import { Input } from "@oreilla/ui/components/input"
import { Label } from "@oreilla/ui/components/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@oreilla/ui/components/card"
import TimezonePicker from "./TimezonePicker"
import { ArrowRight, Loader2, AlertCircle, Link2 } from "lucide-react"
import CompletedIcon from "@oreilla/ui/icons/completed"
import ClosedIcon from "@oreilla/ui/icons/closed"
import {
  isNameValid,
  isDomainValid,
  isSlugValid,
  isTimezoneValid,
  suggestDomainFix,
} from "../../lib/validators"

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

  const onNext = React.useCallback(() => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1)
      return
    }
    if (allValid && !isCreating) {
      create()
    }
  }, [step, steps.length, allValid, isCreating, create])

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
    <Card className="w-full max-w-[520px] mx-auto ring-0 ring-offset-0">
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
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-accent">{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {step === 0 && (
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <div className="relative flex items-center">
              <span className="inline-flex items-center h-10 px-3 bg-muted border rounded-l-md text-accent select-none text-sm border-r-0">
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
            {!domainValid && domain.length > 0 && (
              <div className="text-xs text-destructive flex items-center gap-1 mt-1.5">
                <span>Invalid domain</span>
                {(() => {
                  const suggested = suggestDomainFix(domain)
                  if (!suggested) return null
                  return (
                    <>
                      <span>— did you mean</span>
                      <button
                        type="button"
                        className="underline hover:text-destructive/80"
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
            />
          </div>
        )}

        {step === 2 && (
          <div className="space-y-2">
            <Label htmlFor="slug" className="flex items-center gap-2">
              Workspace URL
              {slugLocked && (
                <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal">
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
                className="h-10 pl-9 pr-24 bg-muted/50 placeholder:text-accent"
                disabled={!!slugLocked}
                autoFocus
              />
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                .oreilla.com
              </span>
              <div className="absolute right-[6.5rem] top-1/2 -translate-y-1/2">
                {slugChecking ? (
                  <Loader2 className="size-4 text-muted-foreground animate-spin" />
                ) : !slugLocked && slug && slugAvailable === true ? (
                  <CompletedIcon size={16} className="text-emerald-600" />
                ) : !slugLocked &&
                  (slugAvailable === false || (slug && !isSlugValid(slug))) ? (
                  <ClosedIcon size={16} className="text-destructive" />
                ) : null}
              </div>
            </div>
            {slug && !isSlugValid(slug) && (
              <p className="text-xs text-destructive">
                Use lowercase letters, numbers, and dashes (min 5 chars).
              </p>
            )}
            {!slugLocked && slugAvailable === false && (
              <p className="text-xs text-destructive">This URL is already taken.</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-2">
            <Label>Timezone</Label>
            <TimezonePicker value={timezone} onChange={setTimezone} now={now} />
            <p className="text-xs text-accent">
              All project graphs, ranges and timestamps will be matched to this timezone. Can be updated later.
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2">
        <Button variant="ghost" size="sm" onClick={onBack} disabled={step === 0 || isCreating}>
          Back
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onNext}
          disabled={isCreating || (!canNext && step !== steps.length - 1) || (step === steps.length - 1 && !allValid)}
          className="min-w-24"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating...
            </>
          ) : step === steps.length - 1 ? (
            "Create"
          ) : (
            "Next"
          )}
          {!isCreating && step !== steps.length - 1 && <ArrowRight className="ml-2 size-4 opacity-50" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
