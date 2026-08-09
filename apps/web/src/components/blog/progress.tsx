"use client";

import type {
  ReadingProgressProps,
  ScrollBehaviorOption,
} from "../../types/reading";
import { usePrefersReducedMotion } from "../../hooks/motion";
import { useReadingProgress } from "../../hooks/progress";
import { ReadingProgressButton } from "./button";

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
