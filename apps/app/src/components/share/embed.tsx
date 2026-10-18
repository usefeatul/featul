"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@featul/ui/lib/utils";
import { buildWidgetNextSnippet, buildWidgetSnippet } from "@/lib/share";
import CodeBlock from "./code";
import CopyButton from "./copy";
import ShareSection from "./section";
import { shareCardClass } from "./styles";

type Theme = "auto" | "light" | "dark";
type Position = "left" | "right";
type Framework = "html" | "next";

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
        className="flex rounded-lg bg-muted/40 p-0.5 dark:bg-white/5"
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

const mockNavWidths = ["w-16", "w-14", "w-20", "w-12", "w-[4.5rem]", "w-14"];
const mockBars = [38, 44, 41, 52, 49, 58, 55, 63, 60, 71, 68, 79];
const mockRowWidths = ["w-24", "w-20", "w-28", "w-16", "w-24"];

function MockApp({ dark }: { dark: boolean }) {
  const line = dark ? "bg-white/[0.06]" : "bg-black/[0.06]";
  const soft = dark ? "bg-white/[0.04]" : "bg-black/[0.04]";
  const border = dark ? "border-white/[0.06]" : "border-black/[0.06]";
  const card = cn(
    "rounded-lg border",
    border,
    dark ? "bg-[#1c1c1c]" : "bg-white",
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none flex h-full select-none opacity-80 blur-[2px]"
    >
      <aside
        className={cn(
          "hidden w-52 shrink-0 flex-col border-r p-3 md:flex",
          border,
          dark ? "bg-[#121212]" : "bg-[#f3f3f3]",
        )}
      >
        <div className="flex items-center gap-2 px-2 py-1.5">
          <span className="size-5 rounded-md bg-gradient-to-br from-blue-500/70 to-violet-500/70" />
          <span className={cn("h-2.5 w-14 rounded-full", line)} />
        </div>
        <div className={cn("mt-3 h-7", card)} />
        <div className="mt-4 space-y-1">
          {mockNavWidths.map((width, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-2",
                index === 0 && soft,
              )}
            >
              <span className={cn("size-3.5 rounded", line)} />
              <span className={cn("h-2 rounded-full", width, line)} />
            </div>
          ))}
        </div>
        <div className="mt-auto flex items-center gap-2 px-2 py-1.5">
          <span className={cn("size-6 rounded-full", line)} />
          <div className="space-y-1.5">
            <div className={cn("h-2 w-16 rounded-full", line)} />
            <div className={cn("h-1.5 w-20 rounded-full", soft)} />
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 space-y-4 p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2">
            <div className={cn("h-3.5 w-28 rounded", line)} />
            <div className={cn("h-2 w-40 rounded-full", soft)} />
          </div>
          <div className="flex items-center gap-2">
            <span className={cn("h-7 w-20", card)} />
            <span className="h-7 w-20 rounded-md bg-blue-500/60" />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((index) => (
            <div key={index} className={cn("space-y-2.5 p-3", card)}>
              <div className={cn("h-2 w-12 rounded-full", soft)} />
              <div className="flex items-center gap-2">
                <div className={cn("h-4 w-16 rounded", line)} />
                <div className="h-2 w-8 rounded-full bg-emerald-500/30" />
              </div>
            </div>
          ))}
        </div>

        <div className={cn("p-4", card)}>
          <div className="flex items-center justify-between">
            <div className={cn("h-2.5 w-16 rounded-full", line)} />
            <div className={cn("h-2 w-12 rounded-full", soft)} />
          </div>
          <div className="mt-4 flex h-36 items-end gap-2">
            {mockBars.map((value, index) => (
              <div
                key={index}
                className={cn(
                  "flex-1 rounded-t",
                  index === mockBars.length - 1
                    ? "bg-blue-500/60"
                    : "bg-blue-500/20",
                )}
                style={{ height: `${value}%` }}
              />
            ))}
          </div>
        </div>

        <div className={cn("overflow-hidden", card)}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className={cn("h-2.5 w-24 rounded-full", line)} />
            <div className={cn("h-2 w-10 rounded-full", soft)} />
          </div>
          {mockRowWidths.map((width, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center gap-4 border-t px-4 py-3",
                border,
              )}
            >
              <span className={cn("size-5 rounded", line)} />
              <span className={cn("h-2 rounded-full", width, line)} />
              <span className={cn("ml-auto h-2 w-10 rounded-full", soft)} />
              <span className={cn("h-4 w-12 rounded-full", soft)} />
              <span className={cn("h-2 w-10 rounded-full", line)} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

function Preview({
  workspaceId,
  theme,
  position,
}: {
  workspaceId: string;
  theme: Theme;
  position: Position;
}) {
  const [origin, setOrigin] = useState("");
  const [systemDark, setSystemDark] = useState(true);
  useEffect(() => {
    setOrigin(window.location.origin);
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setSystemDark(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  const dark = theme === "dark" || (theme === "auto" && systemDark);
  const src = origin
    ? `/widget/${encodeURIComponent(workspaceId)}/frame?${new URLSearchParams({
        parentOrigin: origin,
        theme,
        position,
      })}`
    : null;

  return (
    <div className={shareCardClass}>
      <div className="flex items-center gap-1.5 border-b border-border/50 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-muted-foreground/20" />
        <span className="size-2.5 rounded-full bg-muted-foreground/20" />
        <span className="size-2.5 rounded-full bg-muted-foreground/20" />
        <span className="mx-auto rounded-md bg-muted/50 px-3 py-0.5 text-[11px] text-accent dark:bg-white/5">
          yourapp.com
        </span>
        <span className="w-[42px]" />
      </div>
      <div
        className={cn(
          "relative h-[50rem] overflow-hidden transition-colors duration-300",
          dark ? "bg-[#161616]" : "bg-[#fafafa]",
        )}
      >
        <MockApp dark={dark} />
        <div
          className={cn(
            "absolute bottom-4 flex flex-col gap-3 transition-all duration-300",
            position === "right" ? "right-4 items-end" : "left-4 items-start",
          )}
        >
          <div
            className={cn(
              "h-[42rem] w-[min(400px,calc(100vw-5rem))] overflow-hidden rounded-xl border shadow-2xl",
              dark
                ? "border-white/10 bg-[#111111]"
                : "border-black/10 bg-[#f3f3f3]",
            )}
          >
            {src ? (
              <iframe
                key={theme}
                src={src}
                title="Live widget preview"
                loading="lazy"
                className="size-full"
                style={{ colorScheme: dark ? "dark" : "light" }}
              />
            ) : null}
          </div>
        </div>
      </div>
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
  const [framework, setFramework] = useState<Framework>("html");
  const [showCode, setShowCode] = useState(false);
  const html = buildWidgetSnippet(workspaceId, theme, position);
  const next = buildWidgetNextSnippet(workspaceId, theme, position);
  const snippet = framework === "html" ? html : next;
  const handoff = `Please add the ${name} feedback widget to our app.\n\nPlain HTML: paste this before the closing </body> tag.\n\n${html}\n\nNext.js: render this component once in the root layout.\n\n${next}\n\nDocs: https://www.featul.com/docs/getting-started/widget`;

  return (
    <ShareSection
      title="In-app widget"
      description="Let users send feedback without leaving your product. This is your live widget."
    >
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
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

      <Preview workspaceId={workspaceId} theme={theme} position={position} />

      <div className="flex flex-wrap items-center gap-2">
        <CopyButton text={html} label="Copy HTML snippet" primary />
        <CopyButton text={next} label="Copy Next.js component" />
        <CopyButton text={handoff} label="Send to a teammate" />
        <button
          type="button"
          aria-expanded={showCode}
          onClick={() => setShowCode((value) => !value)}
          className="ml-auto text-xs text-accent hover:text-foreground"
        >
          {showCode ? "Hide code" : "Show code"}
        </button>
      </div>

      {showCode ? (
        <CodeBlock
          code={snippet}
          label="Widget snippet"
          header={
            <div role="tablist" aria-label="Framework" className="flex gap-1">
              {(
                [
                  ["html", "HTML"],
                  ["next", "Next.js"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={framework === value}
                  onClick={() => setFramework(value)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    framework === value
                      ? "bg-muted/70 font-medium text-foreground dark:bg-white/8"
                      : "text-accent hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          }
        />
      ) : null}

      <p className="text-xs leading-5 text-accent">
        Paste the HTML before the closing{" "}
        <code className="text-foreground/80">&lt;/body&gt;</code> tag, or render
        the Next.js component once in your root layout. Want to know who sent
        what? Sign users on your server with your{" "}
        <Link
          href={`/workspaces/${slug}/settings/workspace`}
          className="text-foreground underline-offset-4 hover:underline"
        >
          widget secret
        </Link>{" "}
        and call{" "}
        <code className="rounded bg-muted/50 px-1 py-0.5 text-foreground/80 dark:bg-white/5">
          featul.identify()
        </code>
        .{" "}
        <a
          href="https://www.featul.com/docs/getting-started/widget"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground underline-offset-4 hover:underline"
        >
          Read the docs →
        </a>
      </p>
    </ShareSection>
  );
}
