"use client";

import { useEffect, useMemo, useState } from "react";
import { Dots } from "./dots";
import { Shimmer } from "./shimmer";

export type AssistantPhase = "reading" | "planning" | "writing" | "applying";
export type AssistantActivity = "ask" | "rewrite" | "patch" | "tags";

const PHASES: AssistantPhase[] = ["reading", "planning", "writing", "applying"];

function phaseLabel(phase: AssistantPhase, activity: AssistantActivity) {
  if (phase === "reading") return "Reading changelog";
  if (phase === "planning") return "Planning response";
  if (phase === "writing") {
    if (activity === "ask") return "Writing response";
    if (activity === "tags") return "Finding relevant tags";
    if (activity === "patch") return "Rewriting selection";
    return "Writing update";
  }
  if (activity === "tags") return "Adding tags";
  if (activity === "patch") return "Applying selection";
  return "Editing text";
}

export function Progress({
  phase,
  activity,
  startedAt,
  durationMs,
  compact = false,
  complete = false,
}: {
  phase: AssistantPhase;
  activity: AssistantActivity;
  startedAt?: number;
  durationMs?: number;
  compact?: boolean;
  complete?: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  const activeIndex = PHASES.indexOf(phase);

  useEffect(() => {
    if (complete) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [complete]);

  const elapsed = useMemo(() => {
    const milliseconds = complete
      ? (durationMs ?? 0)
      : now - (startedAt ?? now);
    return Math.max(0, Math.round(milliseconds / 1000));
  }, [complete, durationMs, now, startedAt]);

  const lastIndex = complete
    ? activity === "ask" || activity === "tags"
      ? PHASES.indexOf("writing")
      : PHASES.indexOf("applying")
    : activeIndex;
  const visiblePhases = compact
    ? [phase]
    : PHASES.slice(0, Math.max(0, lastIndex) + 1);

  return (
    <div
      className="space-y-2.5 text-xs font-light text-muted-foreground/55"
      role="status"
      aria-live={complete ? "off" : "polite"}
    >
      <div className="flex items-center gap-2">
        <Dots active={!complete} />
        {complete ? (
          <span>{`Thought for ${elapsed}s`}</span>
        ) : (
          <Shimmer>Thinking…</Shimmer>
        )}
      </div>

      {visiblePhases.map((visiblePhase) => {
        const isActive = visiblePhase === phase && !complete;

        return (
          <div key={visiblePhase} className="flex items-center gap-2">
            <Dots active={isActive} />
            {isActive ? (
              <Shimmer>{phaseLabel(visiblePhase, activity)}</Shimmer>
            ) : (
              <span>{phaseLabel(visiblePhase, activity)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
