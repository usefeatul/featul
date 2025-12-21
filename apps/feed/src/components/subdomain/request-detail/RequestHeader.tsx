import React from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface RequestHeaderProps {
  sidebarPosition: "left" | "right";
  backLink?: string;
}

export function RequestHeader({ sidebarPosition, backLink = "/" }: RequestHeaderProps) {
  return (
    <div
      className={
        sidebarPosition === "left"
          ? "grid md:grid-cols-[0.3fr_0.7fr] gap-6 mb-6"
          : "grid md:grid-cols-[0.7fr_0.3fr] gap-6 mb-6"
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
        <Link
          href={backLink}
          className="inline-flex items-center justify-center rounded-md  border bg-card text-foreground border-muted hover:bg-muted hover:text-accent-foreground hover:border-accent/20 dark:bg-black/40 dark:hover:bg-black/50 p-2 transition-colors"
          aria-label="Back to board"
        >
          <ChevronLeft className="size-4" />
        </Link>
        <h1 className="text-xl font-semibold text-foreground">Submission</h1>
      </div>

      {/* Right Spacer for Sidebar */}
      {sidebarPosition === "right" ? (
        <div className="hidden md:block" />
      ) : null}
    </div>
  );
}
