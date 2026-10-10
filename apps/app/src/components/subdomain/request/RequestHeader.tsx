import React from "react";
import Link from "next/link";
import { ChevronLeft } from "@/components/global/icons";
import { Button } from "@featul/ui/components/button";
import { Toolbar, toolbarItemClass } from "@featul/ui/components/toolbar";
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
        <Toolbar size="sm" className="w-fit">
          <Button variant="plain" size="icon" asChild className={cn(toolbarItemClass, "px-2.5")}>
            <Link href={backLink} aria-label="Back to board">
              <ChevronLeft className="size-4" />
            </Link>
          </Button>
        </Toolbar>
        <h1 className="text-xl font-semibold text-foreground">Submissions</h1>
      </div>

      {/* Right Spacer for Sidebar */}
      {sidebarPosition === "right" ? (
        <div className="hidden md:block" />
      ) : null}
    </div>
  );
}
