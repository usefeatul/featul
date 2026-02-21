"use client";

import React from "react";
import { SettingsDialogShell } from "../global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { client } from "@featul/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { CsvIcon } from "@featul/ui/icons/csv";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X } from "lucide-react";
import {
  type ImportResult,
  invalidateWorkspaceImportQueries,
  parseImportResultPayload,
  readImportErrorMessage,
} from "./import-utils";

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
      setError(err instanceof Error ? err.message : "Failed to import data. Please try again.");
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
    >
      <div className="p-4 space-y-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* Drop zone */}
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-foreground font-medium">
                  Drop your CSV file here
                </p>
                <p className="text-xs text-accent mt-1">
                  or click to browse
                </p>
              </div>

              {/* Selected file */}
              {file && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-muted/40 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CsvIcon className="size-4 flex-shrink-0" />
                    <span className="text-sm text-foreground truncate">{file.name}</span>
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
                </motion.div>
              )}

              {/* Error */}
              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              {/* Import button */}
              <Button
                onClick={handleImport}
                disabled={!file}
                className="w-full"
              >
                Import CSV
              </Button>
            </motion.div>
          )}

          {state === "uploading" && (
            <motion.div
              key="uploading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-6 gap-3"
            >
              <LoaderIcon className="animate-spin text-muted-foreground size-5" />
              <p className="text-sm text-accent">Importing your data...</p>
            </motion.div>
          )}

          {state === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="flex flex-col items-center justify-center py-6 gap-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center space-y-1"
              >
                <p className="text-sm font-medium text-foreground">Import complete!</p>
                <p className="text-sm text-accent mt-0.5">
                  Imported {result?.importedCount ?? 0} posts.
                </p>
                <p className="text-xs text-accent">
                  Created {result?.createdCount ?? 0}, updated {result?.updatedCount ?? 0}, skipped {result?.skippedCount ?? 0}.
                </p>
                {result?.errorCount ? (
                  <p className="text-xs text-destructive">
                    {result.errorCount} row errors were found.
                  </p>
                ) : null}
              </motion.div>

              {result && (result.errors.length > 0 || result.warnings.length > 0) ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="w-full text-left space-y-2"
                >
                  {result.errors.length > 0 ? (
                    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-2">
                      <p className="text-xs font-medium text-destructive mb-1">Top errors</p>
                      <ul className="space-y-1">
                        {result.errors.slice(0, 5).map((issue, idx) => (
                          <li key={`error-${idx}`} className="text-xs text-destructive/90">
                            {issue.row ? `Row ${issue.row}: ` : ""}
                            {issue.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {result.warnings.length > 0 ? (
                    <div className="rounded-md border border-border bg-muted/30 p-2">
                      <p className="text-xs font-medium text-foreground mb-1">Top warnings</p>
                      <ul className="space-y-1">
                        {result.warnings.slice(0, 5).map((issue, idx) => (
                          <li key={`warning-${idx}`} className="text-xs text-accent">
                            {issue.row ? `Row ${issue.row}: ` : ""}
                            {issue.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </motion.div>
              ) : null}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button onClick={() => handleClose(false)}>
                  Done
                </Button>
              </motion.div>
            </motion.div>
          )}

          {state === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-6 gap-4"
            >
              <p className="text-sm text-destructive text-center">{error}</p>
              <Button variant="secondary" onClick={() => setState("idle")}>
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SettingsDialogShell>
  );
}
