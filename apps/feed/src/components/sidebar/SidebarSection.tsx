"use client";

import React from "react";
import { cn } from "@feedgot/ui/lib/utils";

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
    <div className={cn("p-3", className)}>
      {title ? <div className="mb-2 text-xs text-accent">{title}</div> : null}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

