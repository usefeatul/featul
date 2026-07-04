"use client";

import React from "react";
import { cn } from "@featul/ui/lib/utils";

export default function SidebarSection({
  title,
  children,
  className = "",
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("px-2 py-1.5", className)}>
      {title ? (
        <div className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-normal text-accent/80">
          {title}
        </div>
      ) : null}
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}
