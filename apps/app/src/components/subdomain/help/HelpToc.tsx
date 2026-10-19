"use client";

import React from "react";
import { cn } from "@featul/ui/lib/utils";
import type { HelpHeading } from "./content";

/** "On this page" outline that follows the reader's scroll position. */
export function HelpToc({ headings }: { headings: HelpHeading[] }) {
  const [active, setActive] = React.useState(headings[0]?.id ?? "");
  const top = Math.min(...headings.map((h) => h.level));

  React.useEffect(() => {
    if (headings.length === 0) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      let current = headings[0]!.id;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (el && el.getBoundingClientRect().top <= 120) current = h.id;
      }
      // At the very bottom the last short sections can never reach the line.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        current = headings[headings.length - 1]!.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-xs font-medium text-foreground">On this page</p>
      <ul className="space-y-0.5 border-l border-border/70 dark:border-white/10">
        {headings.map((h) => {
          const isActive = h.id === active;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  document.getElementById(h.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  history.replaceState(null, "", `#${h.id}`);
                  setActive(h.id);
                }}
                style={{ paddingLeft: `${0.75 + (h.level - top) * 0.75}rem` }}
                className={cn(
                  "-ml-px block border-l py-1 pr-2 text-[13px] leading-5 transition-colors",
                  isActive
                    ? "border-primary font-medium text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
