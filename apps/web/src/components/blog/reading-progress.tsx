"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@feedgot/ui/lib/utils";
import { UpIcon } from "@feedgot/ui/icons/up";
import type {
  ReadingProgressProps,
  ScrollBehaviorOption,
} from "../../types/reading";

function clamp(n: number, min = 0, max = 1) {
  return Math.min(max, Math.max(min, n));
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(media.matches);
    onChange();
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    }
    if ("onchange" in media) {
      const prev: any = (media as any).onchange;
      (media as any).onchange = onChange as any;
      return () => {
        (media as any).onchange = prev ?? null;
      };
    }
    return () => {};
  }, []);
  return reduced;
}

export function ReadingProgress({
  targetSelector = "article",
  position = "bottom",
  className,
}: ReadingProgressProps) {
  const [percent, setPercent] = useState(0);
  // Control visibility so we can show 100% briefly before hiding
  const [visible, setVisible] = useState(true);
  const hideTimer = useRef<number | null>(null);
  const rafId = useRef<number | null>(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  const isTop = position === "top";
  const posClass = useMemo(
    () => (isTop ? "top-4" : "bottom-4 sm:bottom-6"),
    [isTop]
  );

  useEffect(() => {
    const measure = () => {
      const el = document.querySelector<HTMLElement>(targetSelector);
      if (!el) {
        // Fallback to page scroll
        const doc = document.documentElement;
        const max = Math.max(
          1,
          (doc.scrollHeight || 0) - (window.innerHeight || 0)
        );
        const p = max > 0 ? clamp(window.scrollY / max) : 0;
        setPercent(Math.round(p * 100));
        return;
      }

      const rect = el.getBoundingClientRect();
      const start = rect.top + window.scrollY;
      const height = el.offsetHeight;
      const max = Math.max(1, height - window.innerHeight);
      const raw = (window.scrollY - start) / max;
      const p = clamp(raw);
      setPercent(Math.round(p * 100));
    };

    const scheduleMeasure = () => {
      if (rafId.current != null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", scheduleMeasure, { passive: true });
    window.addEventListener("resize", scheduleMeasure);

    // Recalculate when the target element's size changes (e.g. images load)
    let ro: ResizeObserver | null = null;
    const el = document.querySelector<HTMLElement>(targetSelector);
    if (el && "ResizeObserver" in window) {
      ro = new ResizeObserver(scheduleMeasure);
      ro.observe(el);
    }

    return () => {
      window.removeEventListener("scroll", scheduleMeasure);
      window.removeEventListener("resize", scheduleMeasure);
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
        rafId.current = null;
      }
      if (ro) ro.disconnect();
    };
  }, [targetSelector]);

  const ariaLabel = useMemo(() => `Reading progress ${percent}%`, [percent]);

  // Show 100% for ~700ms, then hide; reshow if user scrolls up
  useEffect(() => {
    if (percent >= 100) {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
      hideTimer.current = window.setTimeout(() => setVisible(false), 700);
    } else {
      if (!visible) setVisible(true);
      if (hideTimer.current) {
        window.clearTimeout(hideTimer.current);
        hideTimer.current = null;
      }
    }
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [percent, visible]);

  if (!visible) return null;

  const scrollTopBehavior: ScrollBehaviorOption = prefersReducedMotion
    ? "auto"
    : "smooth";

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-label={ariaLabel}
      className={cn(
        "fixed left-1/2 -translate-x-1/2 z-50",
        posClass,
        className
      )}
      style={
        isTop
          ? undefined
          : { bottom: "calc(env(safe-area-inset-bottom) + 1rem)" }
      }
    >
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: scrollTopBehavior })}
        title="Scroll to top"
        className={cn(
          "inline-flex items-center gap-4 rounded-lg",
          "bg-black/95 text-white dark:bg-zinc-900",
          "px-4 py-2 text-xs font-medium shadow/50",
          "border border-white/10 dark:border-zinc-800"
        )}
      >
        <UpIcon className="size-3.5" aria-hidden />
        <span className="tabular-nums">{percent}%</span>
      </button>
    </div>
  );
}
