"use client";

import React from "react";
import { cn } from "@featul/ui/lib/utils";
import { sidebarSectionLabelClassName } from "./styles";

export default function SidebarSection({
  title,
  trailing,
  children,
  className = "",
}: {
  title?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("p-3", className)}>
      {title ? (
        <div className={cn(sidebarSectionLabelClassName, "mb-2")}>
          <span className="min-w-0 flex-1 truncate">{title}</span>
          {trailing}
        </div>
      ) : null}
      <div className="space-y-1">{children}</div>
    </div>
  );
}

