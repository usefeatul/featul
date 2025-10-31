export type ScrollBehaviorOption = "auto" | "instant" | "smooth";
export type ReadingProgressPosition = "top" | "bottom";

export interface ReadingProgressProps {
  targetSelector?: string;
  position?: ReadingProgressPosition;
  className?: string;
}