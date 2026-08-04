import type { FeatureSupport } from "@/config/alternatives";
import { Check, Minus, X } from "lucide-react";

export function StatusIcon({ value }: { value: FeatureSupport }) {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center size-6 rounded-md  bg-green-300">
        <Check className="size-4 text-green-800" />
      </span>
    );
  if (value === "partial")
    return (
      <span className="inline-flex items-center justify-center size-6 rounded-md  bg-orange-300">
        <Minus className="size-4 text-orange-800" />
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center size-6 rounded-md  bg-red-400">
      <X className="size-4 text-red-800" />
    </span>
  );
}