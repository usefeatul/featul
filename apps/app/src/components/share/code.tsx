import type { ReactNode } from "react";
import CopyButton from "./copy";

export default function CodeBlock({
  code,
  label,
  header,
}: {
  code: string;
  label: string;
  header?: ReactNode;
}) {
  const lines = code.split("\n");
  return (
    <div className="overflow-hidden rounded-xl border border-border/50 bg-muted/30 dark:border-white/8 dark:bg-black/40">
      <div className="flex items-center gap-2 border-b border-border/50 py-1.5 pl-3 pr-1.5 dark:border-white/8">
        <div className="min-w-0 flex-1">
          {header ?? <span className="text-xs text-accent">{label}</span>}
        </div>
        <CopyButton text={code} label="Copy" />
      </div>
      <pre
        tabIndex={0}
        aria-label={label}
        className="max-h-80 overflow-auto py-3 font-mono text-xs leading-6 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50"
      >
        <code className="grid grid-cols-[auto_1fr]">
          {lines.map((line, index) => (
            <span key={index} className="contents">
              <span
                aria-hidden
                className="select-none px-3 text-right text-muted-foreground/50 tabular-nums"
              >
                {index + 1}
              </span>
              <span className="whitespace-pre pl-2 pr-4 text-foreground/85">
                {line || " "}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
