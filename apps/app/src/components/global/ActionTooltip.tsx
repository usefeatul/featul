"use client";

import React from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@featul/ui/components/tooltip";

/** Names an icon-only control on hover and focus. `children` must be a single element that takes a ref. */
export function ActionTooltip({
  label,
  side = "bottom",
  children,
}: {
  label: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  children: React.ReactElement;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent side={side} className="px-2 py-1.5 text-xs font-medium">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
