"use client";

import Link from "next/link";
import React, { useCallback, useEffect } from "react";
import { Button } from "@feedgot/ui/components/button";

type HotkeyLinkProps = {
  hotkey?: string;
  className?: string;
  children?: React.ReactNode;
  label?: string;
};

export function HotkeyLink({
  hotkey = "A",
  className,
  children,
  label,
}: HotkeyLinkProps) {
  const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL;
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLAnchorElement>) => {
      const key = e.key?.toLowerCase();
      if (key === hotkey.toLowerCase()) {
        e.preventDefault();
        // Navigate to the dashboard when the hotkey is pressed while focused on the link
        if (DASHBOARD_URL) {
          window.open(DASHBOARD_URL, "_blank", "noopener,noreferrer");
        }
      }
    },
    [hotkey, DASHBOARD_URL]
  );

  // Global hotkey while component is mounted (with accessibility guards)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping =
        target?.isContentEditable ||
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT";
      if (isTyping) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key?.toLowerCase() === hotkey.toLowerCase()) {
        e.preventDefault();
        if (DASHBOARD_URL) {
          window.open(DASHBOARD_URL, "_blank", "noopener,noreferrer");
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkey, DASHBOARD_URL]);

  return (
    <Button asChild variant="default" size="lg" className={className}>
      <Link
        href={DASHBOARD_URL ?? "#"}
        target="_blank"
        rel="noopener noreferrer"
        onKeyDown={handleKeyDown}
        aria-keyshortcuts={hotkey.toUpperCase()}
        data-sln-event="cta: get started free clicked"
        aria-label={
          typeof (children ?? label ?? "Get started Free") === "string"
            ? ((children ?? label ?? "Get started Free") as string)
            : "Open link"
        }
      >
        {children ?? label ?? "Get started Free"}
        <span className="sr-only">
          Press {hotkey.toUpperCase()} to open dashboard
        </span>
        <kbd
          aria-hidden
          className=" rounded-md font-light bg-white/20 px-2 py-0.5 text-xs leading-4"
        >
          {hotkey.toUpperCase()}
        </kbd>
      </Link>
    </Button>
  );
}
