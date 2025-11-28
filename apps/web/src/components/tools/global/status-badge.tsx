"use client";

import React from "react";
import { Badge } from "@feedgot/ui/components/badge";

type Status = "Low" | "Moderate" | "Strong";

export function getStatusBadgeProps(status: Status) {
  const base = "px-2 h-6 text-xs rounded-md";
  if (status === "Low") {
    return {
      variant: "outline" as const,
      className: `${base} bg-muted text-accent border-border/60`,
    };
  }
  if (status === "Moderate") {
    return {
      variant: "outline" as const,
      className: `${base} bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20`,
    };
  }
  // Strong
  return {
    variant: "outline" as const,
    className: `${base} bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20`,
  };
}

export default function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { variant, className: derivedClassName } = getStatusBadgeProps(status);
  return (
    <Badge variant={variant} className={[derivedClassName, className].filter(Boolean).join(" ")}>
      {status}
    </Badge>
  );
}