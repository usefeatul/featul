"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { ChevronLeftIcon } from "@featul/ui/icons/chevron-left";
import {
  buildWelcomeTourSteps,
  type WelcomeTourStep,
} from "./TourSteps";
import { analyticsEvents, captureAnalyticsEvent } from "@/lib/posthog";
import { cn } from "@featul/ui/lib/utils";

type WelcomeTourDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
  workspaceName: string;
  workspaceSlug: string;
};

const stepMotion = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

function StepContent({ step }: { step: WelcomeTourStep }) {
  return (
    <div className="flex flex-col items-center px-2 py-5 text-center sm:px-4 sm:py-6">
      <div
        className={cn(
          "mb-5 flex size-16 items-center justify-center rounded-xl border border-border/60",
          step.accentClassName,
        )}
      >
        {step.icon}
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {step.title}
      </h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-accent">
        {step.description}
      </p>
    </div>
  );
}

export function WelcomeTourDialog({
  open,
  onOpenChange,
  onComplete,
  workspaceName,
  workspaceSlug,
}: WelcomeTourDialogProps) {
  const steps = React.useMemo(
    () => buildWelcomeTourSteps({ workspaceName, workspaceSlug }),
    [workspaceName, workspaceSlug],
  );
  const [stepIndex, setStepIndex] = React.useState(0);
  const viewedStepsRef = React.useRef<Set<string>>(new Set());
  const finishingRef = React.useRef(false);
  const isLastStep = stepIndex >= steps.length - 1;
  const currentStep = steps[stepIndex] ?? steps[0]!;

  React.useEffect(() => {
    if (!open) {
      setStepIndex(0);
      viewedStepsRef.current.clear();
      return;
    }

    const step = steps[stepIndex];
    if (!step || viewedStepsRef.current.has(step.id)) return;
    viewedStepsRef.current.add(step.id);
    captureAnalyticsEvent(analyticsEvents.welcomeTourStepViewed, {
      step_id: step.id,
      step_index: stepIndex + 1,
      workspace_slug: workspaceSlug,
    });
  }, [open, stepIndex, steps, workspaceSlug]);

  const finish = React.useCallback(
    (action: "completed" | "skipped") => {
      if (finishingRef.current) return;
      finishingRef.current = true;
      captureAnalyticsEvent(analyticsEvents.welcomeTourFinished, {
        action,
        steps_viewed: viewedStepsRef.current.size,
        workspace_slug: workspaceSlug,
      });
      onComplete();
      onOpenChange(false);
    },
    [onComplete, onOpenChange, workspaceSlug],
  );

  React.useEffect(() => {
    if (open) finishingRef.current = false;
  }, [open]);

  React.useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight" || event.key === "Enter") {
        event.preventDefault();
        if (isLastStep) finish("completed");
        else setStepIndex((value) => Math.min(value + 1, steps.length - 1));
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setStepIndex((value) => Math.max(0, value - 1));
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [finish, isLastStep, open, steps.length]);

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        finish("skipped");
        return;
      }
      onOpenChange(nextOpen);
    },
    [finish, onOpenChange],
  );

  const goNext = React.useCallback(() => {
    if (isLastStep) {
      finish("completed");
      return;
    }
    setStepIndex((value) => value + 1);
  }, [finish, isLastStep]);

  const goBack = React.useCallback(() => {
    setStepIndex((value) => Math.max(0, value - 1));
  }, []);

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title="Welcome tour"
      width="wide"
      offsetY="50%"
      icon={<Sparkles className="size-3.5" />}
      innerClassName="px-0 pb-0"
    >
      <div className="flex min-h-[320px] flex-col">
        <div className="flex items-center justify-center gap-2 px-4 pt-1">
          {steps.map((step, index) => (
            <button
              key={step.id}
              type="button"
              aria-label={`Go to step ${index + 1}: ${step.title}`}
              aria-current={index === stepIndex ? "step" : undefined}
              onClick={() => setStepIndex(index)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === stepIndex
                  ? "w-6 bg-primary"
                  : index < stepIndex
                    ? "w-1.5 bg-primary/50"
                    : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40",
              )}
            />
          ))}
        </div>

        <p className="mt-2 text-center text-[11px] tabular-nums text-muted-foreground">
          {stepIndex + 1} of {steps.length}
        </p>

        <div className="relative mt-1 min-h-[240px] flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep.id}
              {...stepMotion}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <StepContent step={currentStep} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-auto border-t border-border/60 bg-background px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="card"
              size="sm"
              onClick={() => finish("skipped")}
            >
              Skip tour
            </Button>

            <div className="flex items-center gap-2">
              {stepIndex > 0 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={goBack}
                >
                  <ChevronLeftIcon className="size-4 opacity-60" />
                  Back
                </Button>
              ) : null}
              <Button type="button" size="sm" onClick={goNext}>
                {isLastStep ? "Get started" : "Continue"}
                {!isLastStep ? (
                  <ArrowRight className="size-4 opacity-60" />
                ) : null}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </SettingsDialogShell>
  );
}
