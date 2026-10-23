"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import {
  Check,
  MicrophoneIcon,
  RetryIcon,
  XMarkIcon,
} from "@/components/global/icons";
import {
  MAX_RECORDING_SECONDS,
  type DictationState,
} from "@/hooks/useSpeechDictation";
import { commentActionIconClass } from "./styles";

const BAR_WIDTH = 3;
const BAR_GAP = 3;
const SAMPLE_EVERY_MS = 60;
const MIN_SCALE = 0.15;

/** Mic button shown in the idle toolbar. */
export default function Dictation({
  onStart,
  disabled,
}: {
  onStart: () => void;
  disabled?: boolean;
}) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="plain"
      disabled={disabled}
      onClick={onStart}
      aria-label="Voice typing"
      title="Voice typing"
      className={commentActionIconClass}
    >
      <MicrophoneIcon className="size-4" />
    </Button>
  );
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Scrolling level meter that fills its row; the newest level enters on the
 * right. With no analyser it holds its last shape, and `frozen` adds a
 * left-to-right shimmer while the clip transcribes.
 */
function Waveform({
  analyser,
  frozen,
}: {
  analyser: AnalyserNode | null;
  frozen: boolean;
}) {
  const barsRef = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const el = barsRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0;
      setCount(
        Math.max(0, Math.floor((width + BAR_GAP) / (BAR_WIDTH + BAR_GAP))),
      );
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!analyser || !count) return;
    const samples = new Float32Array(analyser.fftSize);
    const history = new Array<number>(count).fill(0);
    let frame = 0;
    let lastSample = 0;

    const draw = (now: number) => {
      frame = requestAnimationFrame(draw);
      if (now - lastSample < SAMPLE_EVERY_MS) return;
      lastSample = now;

      analyser.getFloatTimeDomainData(samples);
      let sum = 0;
      for (const sample of samples) sum += sample * sample;
      // Speech RMS is small; boost and curve it so quiet talking still moves.
      const level = Math.sqrt(
        Math.min(1, Math.sqrt(sum / samples.length) * 10),
      );
      history.shift();
      history.push(level);

      const bars = barsRef.current?.children;
      if (!bars) return;
      for (let i = 0; i < bars.length; i++) {
        (bars[i] as HTMLElement).style.transform =
          `scaleY(${Math.max(MIN_SCALE, history[i] ?? 0)})`;
      }
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [analyser, count]);

  return (
    <div
      ref={barsRef}
      aria-hidden
      className="flex h-6 min-w-0 flex-1 items-center justify-center gap-[3px] overflow-hidden"
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-full w-[3px] shrink-0 origin-center rounded-full bg-foreground/70 transition-transform duration-75",
            frozen && "animate-pulse bg-foreground/40",
          )}
          style={{
            transform: `scaleY(${MIN_SCALE})`,
            animationDelay: frozen ? `${i * 25}ms` : undefined,
          }}
        />
      ))}
    </div>
  );
}

/**
 * Replaces the composer toolbar while voice typing: a full-width waveform,
 * timer, and cancel / done controls (Esc / Enter). After a failed
 * transcription it offers a retry that reuses the same recording.
 */
export function DictationBar({
  state,
  elapsed,
  analyser,
  failure,
  onCancel,
  onDone,
  onRetry,
}: {
  state: Exclude<DictationState, "idle">;
  elapsed: number;
  analyser: AnalyserNode | null;
  failure: string | null;
  onCancel: () => void;
  onDone: () => void;
  onRetry: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        onCancel();
      } else if (event.key === "Enter" && !event.shiftKey) {
        if (state === "recording") {
          event.preventDefault();
          event.stopPropagation();
          onDone();
        } else if (state === "failed") {
          event.preventDefault();
          event.stopPropagation();
          onRetry();
        }
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [state, onCancel, onDone, onRetry]);

  if (state === "failed") {
    return (
      <div className="flex h-8 min-w-0 flex-1 items-center justify-between gap-2">
        <p role="alert" className="min-w-0 truncate px-1 text-sm text-accent">
          {failure ?? "Couldn't transcribe that."}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            size="icon-sm"
            variant="plain"
            onClick={onCancel}
            aria-label="Discard recording"
            title="Discard (Esc)"
            className={commentActionIconClass}
          >
            <XMarkIcon className="size-4" />
          </Button>
          <Button
            type="button"
            size="xs"
            variant="default"
            onClick={onRetry}
            title="Retry (Enter)"
            className="h-8 gap-1.5 px-3"
          >
            <RetryIcon className="size-3.5" strokeWidth={2.25} />
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const recording = state === "recording";
  const nearLimit = recording && MAX_RECORDING_SECONDS - elapsed <= 10;

  return (
    <div
      role="status"
      aria-label={
        state === "transcribing"
          ? "Transcribing"
          : `Recording, ${formatTime(elapsed)}`
      }
      className="flex h-8 min-w-0 flex-1 items-center gap-3"
    >
      <Waveform analyser={analyser} frozen={state === "transcribing"} />
      <span
        className={cn(
          "w-8 shrink-0 text-right text-xs tabular-nums text-accent",
          nearLimit && "text-destructive",
        )}
      >
        {formatTime(elapsed)}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          size="icon-sm"
          variant="plain"
          onClick={onCancel}
          aria-label="Cancel voice typing"
          title="Cancel (Esc)"
          className={commentActionIconClass}
        >
          <XMarkIcon className="size-4" />
        </Button>
        <Button
          type="button"
          size="icon-sm"
          variant="default"
          onClick={onDone}
          disabled={!recording}
          aria-label="Stop and transcribe"
          title="Done (Enter)"
        >
          <Check className="size-4" strokeWidth={2.5} />
        </Button>
      </div>
    </div>
  );
}
