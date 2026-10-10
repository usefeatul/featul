import type { FeatureSupport } from "@/config/alternatives";
import {
  IconSquareRoundedCheckFilled,
  IconSquareRoundedMinusFilled,
  IconSquareRoundedXFilled,
} from "@tabler/icons-react";

export function featureSupportLabel(value: FeatureSupport): string {
  if (value === true) return "Yes";
  if (value === "partial") return "Partial";
  return "No";
}

export function StatusIcon({ value }: { value: FeatureSupport }) {
  const Icon =
    value === true
      ? IconSquareRoundedCheckFilled
      : value === "partial"
        ? IconSquareRoundedMinusFilled
        : IconSquareRoundedXFilled;
  const color =
    value === true
      ? "text-emerald-600 dark:text-emerald-400"
      : value === "partial"
        ? "text-amber-600 dark:text-amber-400"
        : "text-rose-600 dark:text-rose-400";

  return (
    <span
      className={`inline-flex size-5 shrink-0 items-center justify-center ${color}`}
      aria-hidden
    >
      <Icon className="size-5" />
    </span>
  );
}
