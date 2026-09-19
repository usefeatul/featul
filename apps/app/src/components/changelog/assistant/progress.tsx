"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  List,
  MessageSquare,
  Pencil,
  Sparkles,
  Tags,
  type LucideIcon,
} from "lucide-react";

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

function phaseIcon(
  phase: AssistantPhase,
  activity: AssistantActivity,
): LucideIcon {
  if (phase === "reading") return BookOpen;
  if (phase === "planning") return List;
  if (phase === "applying") return Check;
  if (activity === "tags") return Tags;
  if (activity === "ask") return MessageSquare;
  return Pencil;
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
        <Sparkles
          strokeWidth={1.5}
          className={
            complete ? "size-3.5 shrink-0" : "size-3.5 shrink-0 animate-pulse"
          }
        />
        <span className={complete ? undefined : "ai-thinking-shimmer"}>
          {complete ? `Thought for ${elapsed}s` : "Thinking…"}
        </span>
      </div>

      {visiblePhases.map((visiblePhase) => {
        const Icon = phaseIcon(visiblePhase, activity);
        const isActive = visiblePhase === phase && !complete;

        return (
          <div key={visiblePhase} className="flex items-center gap-2">
            <Icon
              strokeWidth={1.5}
              className={
                isActive
                  ? "size-3.5 shrink-0 animate-pulse"
                  : "size-3.5 shrink-0"
              }
            />
            <span className={!complete ? "ai-thinking-shimmer" : undefined}>
              {phaseLabel(visiblePhase, activity)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
