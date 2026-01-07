"use client";

import React from "react";
import { SettingsDialogShell } from "../global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { Download } from "lucide-react";
import { FileExportIcon } from "@featul/ui/icons/file-export";
import { LoaderIcon } from "@featul/ui/icons/loader";
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
      icon={<FileExportIcon className="w-4 h-4" />}
    >
      <div className="p-4 space-y-4 overflow-hidden">
        <AnimatePresence mode="wait">
          {state === "exporting" && (
            <motion.div
              key="exporting"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex flex-col items-center justify-center py-6 gap-3"
            >
              <LoaderIcon className="animate-spin text-muted-foreground size-5" />
              <p className="text-sm text-accent">Exporting your data...</p>
            </motion.div>
          )}

          {state === "ready" && (
            <motion.div
              key="ready"
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
                className="text-center"
              >
                <p className="text-sm font-medium text-foreground">Export ready!</p>
                <p className="text-sm text-accent mt-1">
                  Your CSV file is ready to download.
                </p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button onClick={handleDownload} className="gap-2">
                  <Download className="w-4 h-4" />
                  Download CSV
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
              <p className="text-sm text-destructive">{error}</p>
              <Button variant="secondary" onClick={handleExport}>
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SettingsDialogShell>
  );
}

