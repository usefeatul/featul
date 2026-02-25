import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@featul/ui/components/button";

interface RequestHeaderProps {
  sidebarPosition: "left" | "right";
  backLink?: string;
}

export function RequestHeader({ sidebarPosition, backLink = "/" }: RequestHeaderProps) {
  return (
    <div
      className={
        sidebarPosition === "left"
          ? "grid md:grid-cols-[minmax(0,0.3fr)_minmax(0,0.7fr)] gap-6 mb-6"
          : "grid md:grid-cols-[minmax(0,0.7fr)_minmax(0,0.3fr)] gap-6 mb-6"
      }
    >
      {/* Left Spacer for Sidebar */}
      {sidebarPosition === "left" ? (
        <div className="hidden md:block" />
      ) : null}

      {/* Header Content */}
      <div
        className={`flex items-center gap-3 ${sidebarPosition === "left" ? "justify-end" : ""}`}
      >
        <Button variant="nav" size="icon" asChild>
          <Link href={backLink} aria-label="Back to board">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">Submissions</h1>
      </div>

      {/* Right Spacer for Sidebar */}
      {sidebarPosition === "right" ? (
        <div className="hidden md:block" />
      ) : null}
    </div>
  );
}
