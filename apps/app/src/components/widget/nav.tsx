"use client";

import { FillChangelogIcon } from "@featul/ui/icons/fill-changelog";
import { FillFeedbackIcon } from "@featul/ui/icons/fill-feedback";
import { FillRoadmapIcon } from "@featul/ui/icons/fill-roadmap";
import { HomeIcon } from "@featul/ui/icons/home";
import type { Section, WidgetLayoutStyle } from "./types";

type Props = {
  tabs: Section[];
  section: Section;
  accent: string;
  navBorderVisible: boolean;
  fullscreen?: boolean;
  layoutStyle?: WidgetLayoutStyle;
  onSelect: (tab: Section) => void;
};

export function Nav({
  tabs,
  section,
  accent,
  navBorderVisible,
  fullscreen = false,
  layoutStyle = "comfortable",
  onSelect,
}: Props) {
  const navPad =
    layoutStyle === "compact"
      ? "px-2 py-1.5"
      : layoutStyle === "spacious"
        ? "px-4 py-2.5"
        : "px-3 py-2";
  return (
    <nav
      aria-label="Widget navigation"
      className={`grid shrink-0 gap-1.5 ${navPad} transition-[box-shadow] duration-200 ${
        navBorderVisible
          ? "shadow-[inset_0_1px_0_0_rgb(var(--widget-fg)/0.08)]"
          : "shadow-[inset_0_1px_0_0_transparent]"
      } ${fullscreen ? "pb-2.5" : ""}`}
      style={{
        gridTemplateColumns: `repeat(${Math.max(tabs.length, 1)}, minmax(0, 1fr))`,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          aria-current={section === tab ? "page" : undefined}
          className={`relative flex min-h-11 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--widget-accent)] ${
            section === tab
              ? "bg-[rgb(var(--widget-fg)/0.06)] font-semibold"
              : "text-[rgb(var(--widget-fg)/0.55)] hover:bg-[rgb(var(--widget-fg)/0.04)] hover:text-[rgb(var(--widget-fg)/0.85)]"
          }`}
          style={section === tab ? { color: accent } : undefined}
        >
          {tab === "home" ? <HomeIcon className="size-4" size={16} /> : null}
          {tab === "feedback" ? (
            <FillFeedbackIcon className="size-4" size={16} />
          ) : null}
          {tab === "roadmap" ? (
            <FillRoadmapIcon className="size-4" size={16} />
          ) : null}
          {tab === "changelog" ? (
            <FillChangelogIcon className="size-4" size={16} />
          ) : null}
          <span>
            {tab === "changelog"
              ? "Updates"
              : `${tab.charAt(0).toUpperCase()}${tab.slice(1)}`}
          </span>
        </button>
      ))}
    </nav>
  );
}
