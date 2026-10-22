"use client";

import { motion } from "framer-motion";
import { Button } from "@featul/ui/components/button";
import { BoardIcon } from "@/components/global/icons";
import type { ImportResult } from "./import";
import { ResultFooter, ResultPlate, stepMotion } from "./DataDialogKit";

type Props = {
  result: ImportResult | null;
  /** Where the posts came from, e.g. "Canny" or "your CSV". */
  source: string;
  onDone: () => void;
};

/** Finished import: the counts as a board card rising out of the dither, then any notes. */
export function ImportResultSummary({ result, source, onDone }: Props) {
  const rows = [
    { label: "New posts", value: result?.createdCount ?? 0 },
    { label: "Updated posts", value: result?.updatedCount ?? 0 },
    { label: "Skipped", value: result?.skippedCount ?? 0 },
  ];
  const errors = result?.errors ?? [];
  const notes = result?.warnings ?? [];
  const imported = result?.importedCount ?? 0;

  return (
    <motion.div key="success" {...stepMotion} className="flex min-h-0 flex-col">
      <ResultPlate>
        <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5 dark:border-white/[0.07]">
          <BoardIcon className="size-3.5 text-primary" />
          <span className="text-xs font-medium text-foreground">Feedback</span>
          <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground dark:bg-white/[0.06]">
            +{imported} {imported === 1 ? "post" : "posts"}
          </span>
        </div>
        <ul className="divide-y divide-border/50 dark:divide-white/[0.06]">
          {rows.map((row, i) => (
            <li
              key={row.label}
              className="flex animate-rise items-center justify-between px-4 py-2.5 text-sm motion-reduce:[animation-duration:0.01ms]"
              style={{ animationDelay: `${0.1 + 0.08 * i}s` }}
            >
              <span className="text-accent">{row.label}</span>
              <span className="font-medium tabular-nums text-foreground">{row.value}</span>
            </li>
          ))}
        </ul>
      </ResultPlate>

      {errors.length > 0 || notes.length > 0 ? (
        <div className="max-h-40 space-y-2 overflow-y-auto border-t border-border/60 px-5 py-3 sm:px-6 dark:border-white/[0.07]">
          {errors.length > 0 ? (
            <IssueList
              title={`${result?.errorCount ?? errors.length} ${errors.length === 1 ? "problem" : "problems"}`}
              tone="error"
              items={errors}
            />
          ) : null}
          {notes.length > 0 ? <IssueList title="Details" tone="note" items={notes} /> : null}
        </div>
      ) : null}

      <ResultFooter
        title="Import complete"
        description={`Your feedback from ${source} is on your boards now.`}
      >
        <Button onClick={onDone}>Done</Button>
      </ResultFooter>
    </motion.div>
  );
}

function IssueList({
  title,
  tone,
  items,
}: {
  title: string;
  tone: "error" | "note";
  items: { row: number | null; message: string }[];
}) {
  return (
    <div>
      <p className={tone === "error" ? "text-xs font-medium text-destructive" : "text-xs font-medium text-foreground"}>
        {title}
      </p>
      <ul className="mt-1 space-y-0.5">
        {items.slice(0, 5).map((issue, idx) => (
          <li
            key={`${tone}-${idx}`}
            className={tone === "error" ? "text-xs text-destructive/90" : "text-xs text-accent"}
          >
            {issue.row ? `Row ${issue.row}: ` : ""}
            {issue.message}
          </li>
        ))}
      </ul>
    </div>
  );
}
