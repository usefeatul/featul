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

const mockNavGroups = [
  ["w-16", "w-14", "w-20"],
  ["w-12", "w-[4.5rem]", "w-14", "w-16"],
];
const mockSparks = [
  "0,22 12,18 24,20 36,12 48,14 60,6",
  "0,10 12,14 24,9 36,16 48,12 60,18",
  "0,20 12,16 24,18 36,10 48,8 60,4",
];
const mockArea =
  "0,78 25,70 50,74 75,58 100,62 125,46 150,52 175,38 200,42 225,28 250,32 275,18 300,22";
const mockRows = [
  { width: "w-40", status: "bg-emerald-500" },
  { width: "w-32", status: "bg-amber-500" },
  { width: "w-44", status: "bg-blue-500" },
  { width: "w-28", status: "bg-emerald-500" },
  { width: "w-36", status: "bg-rose-500" },
];

function MockApp({ dark }: { dark: boolean }) {
  const line = dark ? "bg-white/[0.07]" : "bg-black/[0.07]";
  const soft = dark ? "bg-white/[0.04]" : "bg-black/[0.04]";
  const border = dark ? "border-white/[0.06]" : "border-black/[0.06]";
  const card = cn(
    "rounded-xl border",
    border,
    dark ? "bg-white/[0.02]" : "bg-white",
  );
  const stroke = dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)";

  return (
    <div
      aria-hidden
      className="pointer-events-none flex h-full select-none opacity-80 blur-[2px]"
    >
      <aside
        className={cn(
          "hidden w-52 shrink-0 flex-col gap-5 border-r p-3 md:flex",
          border,
          dark ? "bg-[#121212]" : "bg-[#f3f3f3]",
        )}
      >
        <div className="flex items-center gap-2 px-1.5 py-1">
          <span className="size-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500" />
          <span className={cn("h-2.5 w-16 rounded-full", line)} />
          <span className={cn("ml-auto size-3 rounded", soft)} />
        </div>
        <div
          className={cn(
            "flex h-7 items-center gap-2 rounded-lg border px-2",
            border,
            soft,
          )}
        >
          <span className={cn("size-3 rounded-full", line)} />
          <span className={cn("h-1.5 w-12 rounded-full", line)} />
          <span className={cn("ml-auto h-3.5 w-6 rounded", line)} />
        </div>
        {mockNavGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            <div className={cn("mx-2 mb-2 h-1.5 w-10 rounded-full", soft)} />
            {group.map((width, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-2.5 rounded-lg px-2 py-[7px]",
                  groupIndex === 0 && index === 0 && line,
                )}
              >
                <span className={cn("size-3.5 rounded-[4px]", line)} />
                <span className={cn("h-2 rounded-full", width, line)} />
                {groupIndex === 0 && index === 1 ? (
                  <span className="ml-auto h-3.5 w-5 rounded-full bg-blue-500/30" />
                ) : null}
              </div>
            ))}
          </div>
        ))}
        <div className={cn("mt-auto space-y-2 p-3", card)}>
          <div className={cn("h-2 w-20 rounded-full", line)} />
          <div className={cn("h-1.5 w-full rounded-full", soft)}>
            <div className="h-full w-2/3 rounded-full bg-blue-500/50" />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b px-5",
            border,
          )}
        >
          <span className={cn("h-2 w-14 rounded-full", soft)} />
          <span className={cn("h-2 w-1.5 rounded-full", soft)} />
          <span className={cn("h-2 w-20 rounded-full", line)} />
          <div className="ml-auto flex -space-x-1.5">
            {["bg-amber-400/60", "bg-rose-400/60", "bg-sky-400/60"].map(
              (color) => (
                <span
                  key={color}
                  className={cn(
                    "size-6 rounded-full ring-2",
                    color,
                    dark ? "ring-[#161616]" : "ring-[#fafafa]",
                  )}
                />
              ),
            )}
          </div>
          <span className="h-7 w-20 rounded-lg bg-blue-500/70" />
        </div>

        <div className="space-y-4 p-5">
          <div className="grid grid-cols-3 gap-3">
            {mockSparks.map((points, index) => (
              <div key={index} className={cn("space-y-3 p-3.5", card)}>
                <div className="flex items-center justify-between">
                  <div className={cn("h-2 w-14 rounded-full", soft)} />
                  <div className="h-3.5 w-9 rounded-full bg-emerald-500/20" />
                </div>
                <div className="flex items-end justify-between gap-2">
                  <div className={cn("h-5 w-20 rounded-md", line)} />
                  <svg viewBox="0 0 60 26" className="h-6 w-14">
                    <polyline
                      points={points}
                      fill="none"
                      stroke={index === 1 ? "#f43f5e" : "#10b981"}
                      strokeOpacity={0.7}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          <div className={cn("p-4", card)}>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className={cn("h-2 w-16 rounded-full", soft)} />
                <div className={cn("h-5 w-28 rounded-md", line)} />
              </div>
              <div className={cn("flex gap-1 rounded-lg p-0.5", soft)}>
                {[0, 1, 2].map((index) => (
                  <span
                    key={index}
                    className={cn("h-5 w-8 rounded-md", index === 1 && line)}
                  />
                ))}
              </div>
            </div>
            <svg
              viewBox="0 0 300 90"
              preserveAspectRatio="none"
              className="mt-4 h-36 w-full"
            >
              <defs>
                <linearGradient id="mock-area" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              {[22, 44, 66].map((y) => (
                <line
                  key={y}
                  x1={0}
                  x2={300}
                  y1={y}
                  y2={y}
                  stroke={stroke}
                  strokeDasharray="3 3"
                  vectorEffect="non-scaling-stroke"
                />
              ))}
              <polygon
                points={`${mockArea} 300,90 0,90`}
                fill="url(#mock-area)"
              />
              <polyline
                points={mockArea}
                fill="none"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
              />
            </svg>
          </div>

          <div className={cn("overflow-hidden", card)}>
            <div className="flex items-center gap-2 px-4 py-3">
              <div className={cn("h-2.5 w-24 rounded-full", line)} />
              <div className={cn("ml-auto h-5 w-14 rounded-md", soft)} />
              <div className={cn("h-5 w-14 rounded-md", soft)} />
            </div>
            {mockRows.map((row, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-center gap-3 border-t px-4 py-3",
                  border,
                )}
              >
                <span className={cn("size-2 rounded-full", row.status)} />
                <span className={cn("h-2 w-8 rounded-full", soft)} />
                <span className={cn("h-2 rounded-full", row.width, line)} />
                <span className={cn("ml-auto h-4 w-14 rounded-full", soft)} />
                <span className={cn("size-5 rounded-full", line)} />
              </div>
            ))}
          </div>
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
          "relative h-[44rem] overflow-hidden transition-colors duration-300",
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
              "h-[38rem] w-[min(370px,calc(100vw-5rem))] overflow-hidden rounded-xl border shadow-2xl",
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
