"use client";

import Link from "next/link";
import React, { useCallback, useEffect } from "react";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { marketingButtonSizeClass } from "./marketing-button-styles";

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
        if (DASHBOARD_URL) {
          window.location.assign(DASHBOARD_URL);
        }
      }
    },
    [hotkey, DASHBOARD_URL]
  );

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
          window.location.assign(DASHBOARD_URL);
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkey, DASHBOARD_URL]);

  return (
    <Button
      asChild
      size="lg"
      className={cn(marketingButtonSizeClass, "border", className)}
    >
      <Link
        href={DASHBOARD_URL ?? "#"}
        onKeyDown={handleKeyDown}
        aria-keyshortcuts={hotkey.toUpperCase()}
        data-sln-event="cta: get started free clicked"
        className="flex items-center gap-2 font-heading"
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
          className="inline-flex min-h-[1.125rem] min-w-[1.125rem] shrink-0 items-center justify-center rounded-sm bg-white/20 px-2 py-0.5 text-[11px] leading-none font-heading"
        >
          {hotkey.toUpperCase()}
        </kbd>
      </Link>
    </Button>
  );
}
