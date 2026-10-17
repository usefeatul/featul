"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "@/components/global/icons";
import { shareCardClass, shareFooterClass } from "./styles";
import { buildWidgetSnippet } from "@/lib/share";
import CopyButton from "./copy";

export default function Embed({
  workspaceId,
  slug,
}: {
  workspaceId: string;
  slug: string;
}) {
  const [theme, setTheme] = useState<"auto" | "light" | "dark">("auto");
  const [position, setPosition] = useState<"left" | "right">("right");
  const snippet = buildWidgetSnippet(workspaceId, theme, position);
  const selectClass =
    "mt-2 h-9 w-full rounded-md border border-border/40 bg-card px-2 text-xs text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50";

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">
            Feedback, right inside your app
          </h3>
          <p className="mt-1 text-xs text-accent">
            Add the widget to let users share ideas without leaving your
            website.
          </p>
        </div>
        <a
          href="https://www.featul.com/docs/getting-started/widget"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-accent hover:text-foreground"
        >
          Setup guide <ExternalLink className="size-3" />
        </a>
      </div>
      <div className="grid items-start gap-6 md:grid-cols-[200px_minmax(0,1fr)]">
        <div className="grid grid-cols-2 gap-5 md:grid-cols-1">
          <div>
            <label htmlFor="widget-theme" className="text-xs font-medium">
              Appearance
            </label>
            <select
              id="widget-theme"
              value={theme}
              onChange={(event) => setTheme(event.target.value as typeof theme)}
              className={selectClass}
            >
              <option value="auto">Follow workspace</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>
          <div>
            <label htmlFor="widget-position" className="text-xs font-medium">
              Launcher position
            </label>
            <select
              id="widget-position"
              value={position}
              onChange={(event) =>
                setPosition(event.target.value as typeof position)
              }
              className={selectClass}
            >
              <option value="right">Bottom right</option>
              <option value="left">Bottom left</option>
            </select>
          </div>
          <p className="col-span-2 text-xs leading-5 text-accent md:col-span-1">
            These options update the snippet. Copy it into your website to apply
            them.
          </p>
          <Link
            href={`/workspaces/${slug}/settings/workspace`}
            className="col-span-2 text-xs text-accent hover:text-foreground md:col-span-1"
          >
            Set up user identity →
          </Link>
        </div>
        <div className={shareCardClass}>
          <div className="border-b border-border/35 px-5 py-4">
            <h4 className="text-sm font-medium">Install the widget</h4>
            <p className="mt-1 text-xs leading-5 text-accent">
              Paste this before the closing{" "}
              <code className="text-foreground/80">&lt;/body&gt;</code> tag.
            </p>
          </div>
          <div className="min-w-0">
            <pre
              tabIndex={0}
              aria-label="Widget installation code"
              className="max-h-96 overflow-auto bg-background/25 p-5 text-xs leading-6 text-accent outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
            >
              <code>{snippet}</code>
            </pre>
          </div>
          <div className={shareFooterClass}>
            <span className="text-xs text-accent">HTML · JavaScript</span>
            <CopyButton text={snippet} label="Copy embed code" primary />
          </div>
        </div>
      </div>
    </section>
  );
}
