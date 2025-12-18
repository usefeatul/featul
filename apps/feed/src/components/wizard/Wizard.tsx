"use client";

import { Button } from "@oreilla/ui/components/button";
import Progress from "./Progress";
import StepName from "./StepName";
import StepDomain from "./StepDomain";
import StepSlug from "./StepSlug";
import TimezonePicker from "./TimezonePicker";
import { ArrowRight } from "lucide-react";
import { useWizardLogic } from "./useWizardLogic";
import {
  isNameValid,
  isDomainValid,
  isSlugValid,
  isTimezoneValid,
} from "../../lib/validators";

export default function WorkspaceWizard({
  className = "",
}: {
  className?: string;
}) {
  const {
    step,
    total,
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
    domainFavicon,
    canNext,
    next,
    prev,
    create,
  } = useWizardLogic();

  return (
    <section className="flex min-h-screen items-center justify-center bg-background p-4 sm:p-8">
      <div className={`w-full max-w-[420px] mx-auto ${className}`}>
        {/* Header */}
        <div className="mb-8 text-center space-y-2">
          <p className="text-[11px] uppercase tracking-[0.2em] text-accent font-medium">
            Welcome to Oreilla
          </p>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Set up your workspace
          </h1>
        </div>

        {/* Card */}
        <div className="bg-card rounded-xl border ring-1 ring-border p-6 sm:p-10">
          {/* Progress */}
          <div className="mb-8 flex items-center justify-between gap-4">
            <Progress step={step} total={total} />
            <span className="text-[10px] uppercase tracking-wider text-accent font-medium whitespace-nowrap">
              Step {step + 1} / {total}
            </span>
          </div>

          <div className="min-h-[220px]">
            <div key={step} className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out">
              {step === 0 && (
                <>
                  <StepName
                    name={name}
                    onChange={setName}
                    isValid={isNameValid(name)}
                    onNext={next}
                  />
                  {slugLocked ? (
                    <div className="mt-5">
                      <div className="rounded-sm bg-muted/50 px-2 py-2 text-xs">
                        <span className="text-accent">Reserved:</span>{" "}
                        <span className="">{slugLocked}.oreilla.com</span>
                      </div>
                    </div>
                  ) : null}
                </>
              )}
              {step === 1 && (
                <StepDomain
                  domain={domain}
                  onChange={setDomain}
                  isValid={domainValid}
                  onNext={next}
                />
              )}
              {step === 2 && (
                <StepSlug
                  slug={slug}
                  onChange={handleSlugChange}
                  checking={slugChecking}
                  available={slugAvailable}
                  disabled={!!slugLocked}
                  onNext={next}
                />
              )}
              {step === 3 && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Choose your team&apos;s timezone.
                    </h2>
                    <p className="text-sm text-accent">
                      We&apos;ll use this for your feedback and roadmap dates.
                    </p>
                  </div>
                  <TimezonePicker
                    value={timezone}
                    onChange={setTimezone}
                    now={now}
                  />
                  {!isTimezoneValid(timezone) ? (
                    <p className="text-xs text-destructive">
                      Please select a valid timezone.
                    </p>
                  ) : null}
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={prev}
              disabled={step === 0}
              className={step === 0 ? "invisible" : ""}
            >
              Back
            </Button>

            <div className="flex items-center gap-4">
              {step === 1 && domainFavicon ? (
                <div className="flex items-center">
                  <img
                    src={domainFavicon}
                    alt="Favicon"
                    className="h-6 w-6 rounded-sm bg-background"
                  />
                </div>
              ) : null}

              {step < total - 1 ? (
                <Button
                  type="button"
                  onClick={next}
                  disabled={!canNext}
                >
                  Continue
                  <ArrowRight className="ml-2 size-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={create}
                  disabled={!canNext || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Workspace"}
                  {!isCreating && <ArrowRight className="ml-2 size-4" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
