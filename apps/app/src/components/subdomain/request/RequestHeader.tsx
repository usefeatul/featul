import React from "react";
import Link from "next/link";
import { ChevronLeft } from "@/components/global/icons";
import { cn } from "@featul/ui/lib/utils";
import { subdomainColumns } from "../layout";

interface RequestHeaderProps {
  sidebarPosition: "left" | "right";
  backLink?: string;
}

export function RequestHeader({ sidebarPosition, backLink = "/" }: RequestHeaderProps) {
  return (
    <div
      className={cn(subdomainColumns(sidebarPosition), "mb-4")}
    >
      {/* Left Spacer for Sidebar */}
      {sidebarPosition === "left" ? (
        <div className="hidden md:block" />
      ) : null}

      {/* Header Content */}
      <div
        className="flex min-h-10 min-w-0 items-center gap-3"
      >
        <Link
          href={backLink}
          className="-ml-1 inline-flex items-center gap-1 rounded-md px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Back to feedback
        </Link>
      </div>

      {/* Right Spacer for Sidebar */}
      {sidebarPosition === "right" ? (
        <div className="hidden md:block" />
      ) : null}
    </div>
  );
}
