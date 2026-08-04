"use client";

import type {
  ReadingProgressProps,
  ScrollBehaviorOption,
} from "../../types/reading";
import { usePrefersReducedMotion } from "../../hooks/use-prefers-reduced-motion";
import { useReadingProgress } from "../../hooks/use-reading-progress";
import { ReadingProgressButton } from "./reading-progress-button";

export function ReadingProgress({
  targetSelector = "article",
  position = "bottom",
  className,
}: ReadingProgressProps) {
  const { percent, visible } = useReadingProgress(targetSelector);
  const prefersReducedMotion = usePrefersReducedMotion();

  if (!visible) return null;

  const scrollTopBehavior: ScrollBehaviorOption = prefersReducedMotion
    ? "auto"
    : "smooth";

  return (
    <ReadingProgressButton
      percent={percent}
      position={position}
      className={className}
      scrollBehavior={scrollTopBehavior}
    />
  );
}
