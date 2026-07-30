"use client";

import { DEMO_CHANGELOG } from "./data";

export function DemoChangelog() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex items-center justify-between px-4 pb-3 pt-4">
        <h3 className="text-base font-semibold text-foreground">Changelog</h3>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-card px-2 py-0.5 text-[10px] text-accent">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Published
        </span>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-hidden px-4 pb-4 text-left">
        <div
          aria-hidden
          className="h-36 w-full rounded-md sm:h-44"
          style={{
            background:
              "repeating-linear-gradient(115deg, #0b0b0f 0px, #2b2118 22px, #b98a4d 34px, #e8dcc8 40px, #6b7280 52px, #0b0b0f 78px)",
          }}
        />

        <div className="mt-3 flex items-center gap-1.5">
          {DEMO_CHANGELOG.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-border/70 bg-card px-2 py-0.5 text-[10px] text-accent"
            >
              {tag}
            </span>
          ))}
          <span className="ml-auto text-[10px] text-accent">
            {DEMO_CHANGELOG.date}
          </span>
        </div>

        <h4 className="mt-3 text-lg font-semibold leading-6 text-foreground">
          Featul changelog: {DEMO_CHANGELOG.title}
        </h4>
        <p className="mt-2 text-xs leading-5 text-accent">
          {DEMO_CHANGELOG.intro}
        </p>

        <h5 className="mt-4 text-sm font-semibold text-foreground">
          Highlights
        </h5>
        <ul className="mt-2 space-y-2">
          {DEMO_CHANGELOG.highlights.map((highlight) => (
            <li key={highlight.title} className="text-xs leading-5">
              <span className="font-medium text-foreground">
                {highlight.title}.
              </span>{" "}
              <span className="text-accent">{highlight.body}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
