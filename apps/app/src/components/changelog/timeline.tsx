"use client";

import { useState, type RefObject } from "react";
import { cn } from "@featul/ui/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@featul/ui/components/tooltip";
import { useChangelogTimeline } from "@/hooks/useChangelogTimeline";

export function Timeline({
  scrollRef,
  title,
}: {
  scrollRef: RefObject<HTMLElement | null>;
  title: string;
}) {
  const { sections, active, jumpTo } = useChangelogTimeline(scrollRef, title);
  const [hovered, setHovered] = useState<number | null>(null);
  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Changelog document timeline"
      className="absolute left-1 top-1/2 z-20 hidden max-h-[60%] w-9 -translate-y-1/2 overflow-y-auto py-2 [scrollbar-width:none] lg:block"
      onMouseLeave={() => setHovered(null)}
    >
      {sections.map((section, index) => (
        <Tooltip key={index}>
          <TooltipTrigger
            aria-label={`Jump to ${section.title}`}
            aria-current={active === index ? "location" : undefined}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => jumpTo(index)}
            onMouseEnter={() => setHovered(index)}
            onFocus={() => setHovered(index)}
            onBlur={() => setHovered(null)}
            onKeyDown={(event) => {
              const next =
                event.key === "ArrowDown"
                  ? index + 1
                  : event.key === "ArrowUp"
                    ? index - 1
                    : event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? sections.length - 1
                        : null;
              if (next === null) return;
              event.preventDefault();
              const buttons = event.currentTarget
                .closest("nav")
                ?.querySelectorAll<HTMLButtonElement>("button");
              buttons?.[Math.max(0, Math.min(sections.length - 1, next))]?.focus();
            }}
            className="group flex h-5 w-9 cursor-pointer items-center rounded-sm pl-1.5 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
          >
            <span
              aria-hidden
              className={cn(
                "h-0.5 rounded-full transition-[width,background-color] duration-150 motion-reduce:transition-none",
                active === index
                  ? "w-6 bg-foreground"
                  : hovered !== null && Math.abs(hovered - index) === 1
                    ? "w-4 bg-muted-foreground/60"
                    : "w-2 bg-muted-foreground/40",
                "group-hover:w-6 group-hover:bg-foreground group-focus-visible:w-6 group-focus-visible:bg-foreground",
              )}
            />
          </TooltipTrigger>
          <TooltipContent
            side="right"
            sideOffset={8}
            className="w-64 max-w-full bg-sidebar p-3 text-sidebar-foreground dark:bg-popover dark:text-popover-foreground"
          >
            <p className="line-clamp-2 text-xs font-medium">{section.title}</p>
            {section.preview && section.preview !== section.title ? (
              <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-muted-foreground">
                {section.preview}
              </p>
            ) : null}
          </TooltipContent>
        </Tooltip>
      ))}
    </nav>
  );
}
