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

export function Nav({ tabs, section, accent, navBorderVisible, fullscreen = false, layoutStyle = "comfortable", onSelect }: Props) {
  const navPad =
    layoutStyle === "compact"
      ? "px-2 py-1.5"
      : layoutStyle === "spacious"
        ? "px-4 py-2.5"
        : "px-3 py-2";
  return (
    <nav
      className={`grid shrink-0 ${navPad} transition-[box-shadow] duration-200 ${
        navBorderVisible
          ? "shadow-[inset_0_1px_0_0_rgb(var(--widget-fg)/0.08)]"
          : "shadow-[inset_0_1px_0_0_transparent]"
      } ${fullscreen ? "pb-2.5" : ""}`}
      style={{ gridTemplateColumns: `repeat(${Math.max(tabs.length, 1)}, minmax(0, 1fr))` }}
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onSelect(tab)}
          className={`relative flex cursor-pointer flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] transition-colors ${
            section === tab ? "" : "text-[rgb(var(--widget-fg)/0.45)] hover:text-[rgb(var(--widget-fg)/0.75)]"
          }`}
          style={section === tab ? { color: accent } : undefined}
        >
          {tab === "home" ? <HomeIcon className="size-4" size={16} /> : null}
          {tab === "feedback" ? <FillFeedbackIcon className="size-4" size={16} /> : null}
          {tab === "roadmap" ? <FillRoadmapIcon className="size-4" size={16} /> : null}
          {tab === "changelog" ? <FillChangelogIcon className="size-4" size={16} /> : null}
          <span>
            {tab === "changelog" ? "Updates" : `${tab.charAt(0).toUpperCase()}${tab.slice(1)}`}
          </span>
        </button>
      ))}
    </nav>
  );
}
