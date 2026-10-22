"use client";

import React from "react";
import { SettingsDialogShell } from "../global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { client } from "@featul/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CsvIcon, Upload, X } from "@/components/global/icons";
import { cn } from "@featul/ui/lib/utils";

import { motion, AnimatePresence } from "framer-motion";

import {
  type ImportResult,
  invalidateWorkspaceImportQueries,
  parseImportResultPayload,
  readImportErrorMessage,
  readThrownImportError,
} from "./import";
import { ImportResultSummary } from "./ImportResultSummary";
import { BannerChips, DataBanner, DataErrorStep, raisedCardClass, stepMotion } from "./DataDialogKit";

type Props = {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ImportState = "idle" | "uploading" | "success" | "error";

export function ImportDialog({ slug, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [state, setState] = React.useState<ImportState>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ImportResult | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileSelect = React.useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Please select a CSV file");
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const handleDrop = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.name.endsWith(".csv")) {
        setError("Please select a CSV file");
        return;
      }
      setFile(droppedFile);
      setError(null);
    }
  }, []);

  const handleDragOver = React.useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const handleImport = React.useCallback(async () => {
    if (!file) return;

    setState("uploading");
    setError(null);
    setResult(null);
    toast.loading("Importing your data...", { id: "import-csv" });

    try {
      // Read file content
      const content = await file.text();
      
      // Add minimum delay for UX
      const [res] = await Promise.all([
        client.workspace.importCsv.$post({ slug, csvContent: content }),
        new Promise((resolve) => setTimeout(resolve, 1500)),
      ]);

      const payload = await res.json().catch(() => null);
      const normalized = parseImportResultPayload(payload);

      if (!res.ok || !normalized) {
        throw new Error(readImportErrorMessage(payload, "Failed to import data"));
      }

      await invalidateWorkspaceImportQueries(queryClient, slug);

      setResult(normalized);
      setState("success");
      toast.success(`Import complete! ${normalized.importedCount} posts imported.`, { id: "import-csv" });
    } catch (err) {
      console.error("Import failed:", err);
      setError(readThrownImportError(err, "Failed to import data. Please try again."));
      setState("error");
      toast.error("Import failed", { id: "import-csv" });
    }
  }, [file, queryClient, slug]);

  const handleClose = React.useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setState("idle");
        setFile(null);
        setError(null);
        setResult(null);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const handleRemoveFile = React.useCallback(() => {
    setFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={handleClose}
      title="Import from CSV"
      icon={<CsvIcon className="size-5" />}
      innerClassName="p-0"
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "idle" && (
          <motion.div key="idle" {...stepMotion}>
            <DataBanner
              title="Import feedback from a spreadsheet"
              description="We match your columns automatically. Rows with an ID update the post they came from."
            >
              <BannerChips items={["Title and description", "Board, status, votes", "Up to 5,000 rows"]} />
            </DataBanner>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="cursor-pointer rounded-xl [corner-shape:squircle] border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary/50"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="mx-auto mb-2 size-7 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Drop your CSV file here</p>
                <p className="mt-1 text-xs text-accent">or click to browse</p>
              </div>

              {/* Selected file */}
              {file && (
                <div className={cn("flex items-center justify-between px-3 py-2", raisedCardClass)}>
                  <div className="flex min-w-0 items-center gap-2">
                    <CsvIcon className="size-4 shrink-0 text-primary" />
                    <span className="truncate text-sm text-foreground">{file.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                  >
                    <X className="size-4" />
                  </Button>
                </div>
              )}

              {error && <p className="text-sm text-destructive">{error}</p>}

              <div className="flex justify-end">
                <Button onClick={handleImport} disabled={!file}>
                  Import CSV
                </Button>
              </div>
            </div>
          </motion.div>
        )}

        {state === "uploading" && (
          <motion.div key="uploading" {...stepMotion} aria-live="polite">
            <DataBanner
              busy
              eyebrow={file ? `Reading ${file.name}` : "Reading your file"}
              title="Moving your feedback in"
              description="Matching columns and creating posts. Keep this window open."
            />
          </motion.div>
        )}

        {state === "success" && (
          <ImportResultSummary result={result} source="your CSV" onDone={() => handleClose(false)} />
        )}

        {state === "error" && (
          <DataErrorStep
            title="We couldn't import that file"
            message={error ?? "Failed to import data. Please try again."}
            onRetry={() => setState("idle")}
          />
        )}
      </AnimatePresence>
    </SettingsDialogShell>
  );
}
