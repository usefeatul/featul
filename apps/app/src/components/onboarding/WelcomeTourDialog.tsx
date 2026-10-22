"use client";

import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { DitherClouds } from "@featul/ui/components/clouds";
import {
  ArrowRight,
  ChevronLeftIcon,
} from "@/components/global/icons";

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
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

const stepTransition = { duration: 0.24, ease: [0.22, 1, 0.36, 1] } as const;

/** Brand plate: the kit's primary contours behind one real product row. */
function StepPlate({ step }: { step: WelcomeTourStep }) {
  return (
    <div className="relative isolate h-44 shrink-0 overflow-hidden bg-primary px-6 sm:h-48">
      <div className="absolute inset-0 -z-10">
        <DitherClouds primary fit="cover" />
      </div>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step.id}
          {...stepMotion}
          transition={stepTransition}
          className="flex h-full items-center justify-center"
        >
          {step.detail}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StepCopy({ step }: { step: WelcomeTourStep }) {
  return (
    <div className="px-5 pt-5 pb-6 sm:px-6">
      <h3 className="text-lg font-semibold tracking-tight text-foreground">
        {step.title}
      </h3>
      <p className="mt-1.5 max-w-md text-sm leading-relaxed text-accent">
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
      innerClassName="p-0"
    >
      <div className="flex flex-col">
        <StepPlate step={currentStep} />

        <div className="relative min-h-[132px] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep.id}
              {...stepMotion}
              transition={stepTransition}
            >
              <StepCopy step={currentStep} />
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3 dark:border-white/[0.07]">
          <div className="flex items-center gap-1.5">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                aria-label={`Go to step ${index + 1}: ${step.title}`}
                aria-current={index === stepIndex ? "step" : undefined}
                onClick={() => setStepIndex(index)}
                className={cn(
                  "h-1.5 cursor-pointer rounded-full transition-all duration-300",
                  index === stepIndex
                    ? "w-6 bg-primary"
                    : index < stepIndex
                      ? "w-1.5 bg-primary/50"
                      : "w-1.5 bg-muted-foreground/25 hover:bg-muted-foreground/40",
                )}
              />
            ))}
            <span className="ml-2 text-[11px] tabular-nums text-muted-foreground">
              {stepIndex + 1} of {steps.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {stepIndex > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={goBack}>
                <ChevronLeftIcon className="size-4 opacity-60" />
                Back
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => finish("skipped")}
              >
                Skip
              </Button>
            )}
            <Button type="button" size="sm" onClick={goNext}>
              {isLastStep ? "Get started" : "Continue"}
              {!isLastStep ? (
                <ArrowRight className="size-4 opacity-60" />
              ) : null}
            </Button>
          </div>
        </div>
      </div>
    </SettingsDialogShell>
  );
}
