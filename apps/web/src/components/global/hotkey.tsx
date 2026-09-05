"use client";

import Link from "next/link";
import React, { useCallback, useEffect } from "react";
import { Button, type buttonVariants } from "@featul/ui/components/button";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@featul/ui/lib/utils";
import { APP_URL } from "@/config/auth";

type HotkeyLinkProps = {
  hotkey?: string;
  className?: string;
  kbdClassName?: string;
  children?: React.ReactNode;
  label?: string;
  variant?: VariantProps<typeof buttonVariants>["variant"];
};

export function HotkeyLink({
  hotkey = "A",
  className,
  kbdClassName,
  children,
  label,
  variant = "default",
}: HotkeyLinkProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLAnchorElement>) => {
      const key = e.key?.toLowerCase();
      if (key === hotkey.toLowerCase()) {
        e.preventDefault();
        window.location.assign(APP_URL);
      }
    },
    [hotkey]
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
        window.location.assign(APP_URL);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [hotkey]);

  return (
    <Button asChild size="lg" variant={variant} className={className}>
      <Link
        href={APP_URL}
        onKeyDown={handleKeyDown}
        aria-keyshortcuts={hotkey.toUpperCase()}
        data-sln-event="cta: get started free clicked"
        className="flex items-center gap-2 font-heading"
        aria-label={
          typeof (children ?? label ?? "Start for free") === "string"
            ? ((children ?? label ?? "Start for free") as string)
            : "Open link"
        }
      >
        {children ?? label ?? "Start for free"}
        <span className="sr-only">
          Press {hotkey.toUpperCase()} to open the app
        </span>
        <kbd
          aria-hidden
          className={cn(
            "rounded-sm bg-white/20 px-1.5 py-0.5 font-heading text-xs text-heading",
            kbdClassName,
          )}
        >
          {hotkey.toUpperCase()}
        </kbd>
      </Link>
    </Button>
  );
}
