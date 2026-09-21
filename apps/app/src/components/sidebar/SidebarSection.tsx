"use client";

import React from "react";
import { cn } from "@featul/ui/lib/utils";
import { sidebarSectionLabelClassName } from "./styles";

export default function SidebarSection({
  title,
  trailing,
  children,
  className = "",
  collapsed = false,
}: {
  title?: string;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  collapsed?: boolean;
}) {
  return (
    <div
      className={cn(collapsed ? "px-1.5 py-2" : "p-3", className)}
    >
      {title && !collapsed ? (
        <div className={cn(sidebarSectionLabelClassName, "mb-2")}>
          <span className="min-w-0 flex-1 truncate">{title}</span>
          {trailing}
        </div>
      ) : null}
      <div className={collapsed ? "space-y-2" : "space-y-1.5"}>{children}</div>
    </div>
  );
}
