import type { FeatureSupport } from "@/config/alternatives";
import { Check, Minus, X } from "lucide-react";

export function StatusIcon({ value }: { value: FeatureSupport }) {
  if (value === true)
    return (
      <span className="inline-flex items-center justify-center size-6 rounded-md  bg-green-200">
        <Check className="size-4 text-green-700" />
      </span>
    );
  if (value === "partial")
    return (
      <span className="inline-flex items-center justify-center size-6 rounded-md  bg-orange-200">
        <Minus className="size-4 text-orange-700" />
      </span>
    );
  return (
    <span className="inline-flex items-center justify-center size-6 rounded-md  bg-red-200">
      <X className="size-5 text-red-600" />
    </span>
  );
}