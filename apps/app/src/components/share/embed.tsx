"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@featul/ui/lib/utils";
import { buildWidgetSnippet, buildWidgetSteps } from "@/lib/share";
import CodeBlock from "./code";
import CopyButton from "./copy";
import ShareSection from "./section";
import { shareCardClass } from "./styles";

type Theme = "auto" | "light" | "dark";
type Position = "left" | "right";

function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-accent">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="flex rounded-lg border border-border/50 bg-muted/20 p-0.5 dark:border-white/8 dark:bg-black/30"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={value === option.value}
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              value === option.value
                ? "bg-background font-medium text-foreground shadow-xs dark:bg-white/10"
                : "text-accent hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Step({
  number,
  title,
  hint,
}: {
  number: number | string;
  title: string;
  hint: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-muted/60 text-[10px] font-medium text-accent dark:bg-white/8">
        {number}
      </span>
      <span className="text-sm font-medium">{title}</span>
      <span className="text-xs text-accent">{hint}</span>
    </div>
  );
}

export default function Embed({
  name,
  workspaceId,
  slug,
}: {
  name: string;
  workspaceId: string;
  slug: string;
}) {
  const [theme, setTheme] = useState<Theme>("auto");
  const [position, setPosition] = useState<Position>("right");
  const steps = buildWidgetSteps(workspaceId, theme, position);
  const snippet = buildWidgetSnippet(workspaceId, theme, position);
  const handoff = `Please add the ${name} feedback widget to our app. Paste this before the closing </body> tag:\n\n${snippet}\n\nTo link feedback to signed-in users, follow: https://www.featul.com/docs/getting-started/widget`;

  return (
    <ShareSection
      title="In-app widget"
      description="Let users send feedback without leaving your product."
    >
      <div className={shareCardClass}>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-border/50 px-5 py-3">
          <Segmented<Theme>
            label="Theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: "auto", label: "Auto" },
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          <Segmented<Position>
            label="Position"
            value={position}
            onChange={setPosition}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ]}
          />
        </div>
        <div className="space-y-5 p-5">
          <div className="space-y-2.5">
            <Step number={1} title="Load the SDK" hint="Once, in your layout" />
            <CodeBlock code={steps.loader} label="SDK loader" />
          </div>
          <div className="space-y-2.5">
            <Step
              number={2}
              title="Start the widget"
              hint="Uses the options above"
            />
            <CodeBlock code={steps.init} label="Initialize script" />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border/50 px-5 py-3">
          <CopyButton text={snippet} label="Copy both" primary />
          <CopyButton text={handoff} label="Copy for a teammate" />
          <a
            href="https://www.featul.com/docs/getting-started/widget"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto text-xs text-accent hover:text-foreground"
          >
            Docs →
          </a>
        </div>
      </div>
      <p className="text-xs leading-5 text-accent">
        Want to know who sent what? Sign users on your server with your{" "}
        <Link
          href={`/workspaces/${slug}/settings/workspace`}
          className="text-foreground underline-offset-4 hover:underline"
        >
          widget secret
        </Link>{" "}
        and call <code className="text-foreground/80">featul.identify()</code>.
      </p>
    </ShareSection>
  );
}
