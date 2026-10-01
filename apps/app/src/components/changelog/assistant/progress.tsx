"use client";

import { Dots } from "./dots";
import { Shimmer } from "./shimmer";

export type AssistantPhase = "reading" | "planning" | "writing" | "applying";
export type AssistantActivity =
  | "conversation"
  | "ask"
  | "rewrite"
  | "patch"
  | "tags";

function phaseLabel(phase: AssistantPhase, activity: AssistantActivity) {
  if (phase === "reading") return "Reading changelog";
  if (phase === "planning") return "Planning response";
  if (phase === "writing") {
    if (activity === "ask" || activity === "conversation")
      return "Writing response";
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
  durationMs,
  complete = false,
}: {
  phase: AssistantPhase;
  activity: AssistantActivity;
  durationMs?: number;
  complete?: boolean;
}) {
  const elapsed = Math.max(0, Math.round((durationMs ?? 0) / 1000));

  return (
    <div
      className="flex items-center gap-2 text-xs font-light text-muted-foreground/55"
      role="status"
      aria-live={complete ? "off" : "polite"}
      aria-atomic="true"
    >
      <Dots active={!complete} />
      {complete ? (
        <span>{`Thought for ${elapsed}s`}</span>
      ) : (
        <Shimmer key={phase}>{phaseLabel(phase, activity)}</Shimmer>
      )}
    </div>
  );
}
