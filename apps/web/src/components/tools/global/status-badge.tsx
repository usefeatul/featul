"use client";

import React from "react";
import { Badge } from "@feedgot/ui/components/badge";

type Status = "Low" | "Moderate" | "Strong";

export function getStatusBadgeProps(status: Status) {
  if (status === "Low") {
    return { variant: "destructive" as const, className: undefined };
  }
  if (status === "Moderate") {
    return {
      variant: "outline" as const,
      className: "bg-yellow-500 text-white border-transparent dark:bg-yellow-600",
    };
  }
  // Strong
  return {
    variant: "outline" as const,
    className: "bg-emerald-600 text-white border-transparent dark:bg-emerald-500",
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