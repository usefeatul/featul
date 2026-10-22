"use client";

import React from "react";
import { SettingsDialogShell } from "../global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import {
  CsvIcon,
  FileExportIcon,
  DownloadIcon,
} from "@/components/global/icons";
import { DataBanner, DataErrorStep, ResultFooter, ResultPlate, stepMotion } from "./DataDialogKit";

import { motion, AnimatePresence } from "framer-motion";

type Props = {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ExportState = "idle" | "exporting" | "ready" | "error";

export function ExportDialog({ slug, open, onOpenChange }: Props) {
  const [state, setState] = React.useState<ExportState>("idle");
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [file, setFile] = React.useState<{ rows: number; bytes: number } | null>(null);

  const handleExport = React.useCallback(async () => {
    setState("exporting");
    setError(null);
    toast.loading("Exporting your data...", { id: "export-csv" });

    try {
      // Run export and minimum delay in parallel
      const [res] = await Promise.all([
        client.workspace.exportCsv.$get({ slug }),
        new Promise((resolve) => setTimeout(resolve, 1500)), // Minimum 1.5s delay
      ]);
      
      if (!res.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await res.blob();
      const text = await blob.text();
      setFile({ rows: countCsvRecords(text), bytes: blob.size });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setState("ready");
      toast.success("Export ready!", { id: "export-csv" });
    } catch (err) {
      console.error("Export failed:", err);
      setError("Failed to export data. Please try again.");
      setState("error");
      toast.error("Export failed", { id: "export-csv" });
    }
  }, [slug]);

  const handleDownload = React.useCallback(() => {
    if (!downloadUrl) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `${slug}-export.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, [downloadUrl, slug]);

  const handleClose = React.useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Reset state when closing
        setState("idle");
        setDownloadUrl(null);
        setError(null);
        setFile(null);
        if (downloadUrl) {
          URL.revokeObjectURL(downloadUrl);
        }
      }
      onOpenChange(newOpen);
    },
    [onOpenChange, downloadUrl]
  );

  // Auto-start export when dialog opens
  React.useEffect(() => {
    if (open && state === "idle") {
      handleExport();
    }
  }, [open, state, handleExport]);

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={handleClose}
      title="Export to CSV"
      icon={<FileExportIcon className="size-5" />}
      innerClassName="p-0"
    >
      <AnimatePresence mode="wait" initial={false}>
        {(state === "idle" || state === "exporting") && (
          <motion.div key="exporting" {...stepMotion} aria-live="polite">
            <DataBanner
              busy
              eyebrow="Exporting"
              title="Packing up your feedback"
              description="Every post with its board, status, votes, author, and dates."
            />
          </motion.div>
        )}

        {state === "ready" && (
          <motion.div key="ready" {...stepMotion}>
            <ResultPlate>
              <div className="flex items-center gap-3 px-4 py-3.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <CsvIcon className="size-4.5 text-primary" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{slug}-export.csv</p>
                  <p className="text-xs tabular-nums text-accent">
                    {file ? `${file.rows} ${file.rows === 1 ? "post" : "posts"} · ${formatBytes(file.bytes)}` : "CSV file"}
                  </p>
                </div>
              </div>
            </ResultPlate>
            <ResultFooter
              title="Export ready"
              description="Opens in Excel, Numbers, or Google Sheets. You can import it back here too."
            >
              <Button onClick={handleDownload} className="gap-2">
                <DownloadIcon className="size-4" />
                Download CSV
              </Button>
            </ResultFooter>
          </motion.div>
        )}

        {state === "error" && (
          <DataErrorStep
            title="We couldn't export your feedback"
            message={error ?? "Failed to export data. Please try again."}
            onRetry={handleExport}
          />
        )}
      </AnimatePresence>
    </SettingsDialogShell>
  );
}

/** Data rows, not raw lines: quoted descriptions can contain newlines. */
function countCsvRecords(csv: string): number {
  let quoted = false;
  let lines = 0;
  for (let i = 0; i < csv.length; i += 1) {
    const ch = csv[i];
    if (ch === '"') quoted = !quoted;
    else if (ch === "\n" && !quoted) lines += 1;
  }
  // The header is the first line and the export has no trailing newline.
  return csv.trim() ? lines : 0;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
