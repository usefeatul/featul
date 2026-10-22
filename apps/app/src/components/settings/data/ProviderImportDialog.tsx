"use client";

import React from "react";
import type { ComponentType } from "react";
import { SettingsDialogShell } from "../global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Label } from "@featul/ui/components/label";
import { client } from "@featul/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { CannyIcon, NoltIcon, ProductBoardIcon } from "@/components/global/icons";
import {
  type ImportResult,
  invalidateWorkspaceImportQueries,
  parseImportResultPayload,
  readImportErrorMessage,
  readThrownImportError,
} from "./import";
import { ImportResultSummary } from "./ImportResultSummary";
import { BannerChips, DataBanner, DataErrorStep, stepMotion } from "./DataDialogKit";

export type ImportProvider = "canny" | "nolt" | "productboard";

type ProviderCopy = {
  title: string;
  icon: ComponentType<{ className?: string }>;
  keyLabel: string;
  keyHelp: string;
  chips: string[];
};

const PROVIDERS: Record<ImportProvider, ProviderCopy> = {
  canny: {
    title: "Import from Canny",
    icon: CannyIcon,
    keyLabel: "Canny secret API key",
    keyHelp: "Find it in your Canny settings under API.",
    chips: ["Posts and boards", "Statuses and votes", "Comments and replies"],
  },
  nolt: {
    title: "Import from Nolt",
    icon: NoltIcon,
    keyLabel: "Nolt API key",
    keyHelp: "Create one in your Nolt board settings under APIs.",
    chips: ["Posts and boards", "Statuses and votes", "No comments"],
  },
  productboard: {
    title: "Import from ProductBoard",
    icon: ProductBoardIcon,
    keyLabel: "ProductBoard API token",
    keyHelp: "Create one in your ProductBoard workspace settings under Public API.",
    chips: ["Features as posts", "Statuses", "Components as boards"],
  },
};

type Props = {
  slug: string;
  provider: ImportProvider | null;
  onOpenChange: (open: boolean) => void;
};

type ImportState = "idle" | "importing" | "success" | "error";

export function ProviderImportDialog({ slug, provider, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [state, setState] = React.useState<ImportState>("idle");
  const [apiKey, setApiKey] = React.useState("");
  const [boardUrl, setBoardUrl] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [result, setResult] = React.useState<ImportResult | null>(null);

  // Keep the last provider while the dialog animates closed.
  const lastProvider = React.useRef<ImportProvider>("canny");
  if (provider) lastProvider.current = provider;
  const current = provider ?? lastProvider.current;
  const copy = PROVIDERS[current];
  const Icon = copy.icon;
  const canSubmit = apiKey.trim().length > 0 && (current !== "nolt" || boardUrl.trim().length > 0);

  const handleClose = React.useCallback(
    (open: boolean) => {
      if (!open) {
        setState("idle");
        setApiKey("");
        setBoardUrl("");
        setError(null);
        setResult(null);
      }
      onOpenChange(open);
    },
    [onOpenChange],
  );

  const handleImport = React.useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!canSubmit) return;

      setState("importing");
      setError(null);
      toast.loading(`Importing from ${copy.title.replace("Import from ", "")}...`, { id: "import-provider" });

      try {
        const key = apiKey.trim();
        const res =
          current === "canny"
            ? await client.workspace.importFromCanny.$post({ slug, apiKey: key })
            : current === "nolt"
              ? await client.workspace.importFromNolt.$post({ slug, apiKey: key, boardUrl: boardUrl.trim() })
              : await client.workspace.importFromProductBoard.$post({ slug, apiKey: key });

        const payload = await res.json().catch(() => null);
        const normalized = parseImportResultPayload(payload);
        if (!res.ok || !normalized) {
          throw new Error(readImportErrorMessage(payload, "Failed to import data"));
        }

        await invalidateWorkspaceImportQueries(queryClient, slug);
        setResult(normalized);
        setState("success");
        toast.success(`Import complete! ${normalized.importedCount} posts imported.`, { id: "import-provider" });
      } catch (err) {
        setError(readThrownImportError(err, "Failed to import data. Please try again."));
        setState("error");
        toast.error("Import failed", { id: "import-provider" });
      }
    },
    [apiKey, boardUrl, canSubmit, copy.title, current, queryClient, slug],
  );

  const name = copy.title.replace("Import from ", "");

  return (
    <SettingsDialogShell
      open={provider !== null}
      onOpenChange={handleClose}
      title={copy.title}
      icon={<Icon className="size-5" />}
      innerClassName="p-0"
    >
      <AnimatePresence mode="wait" initial={false}>
        {state === "idle" && (
          <motion.form key="idle" onSubmit={handleImport} {...stepMotion}>
            <DataBanner
              title={`Bring your ${name} feedback over`}
              description="Running it again later updates what you already imported, so nothing is duplicated."
            >
              <BannerChips items={copy.chips} />
            </DataBanner>

            <div className="space-y-4 px-5 py-5 sm:px-6">
              {current === "nolt" ? (
                <div className="space-y-1.5">
                  <Label htmlFor="provider-board-url">Nolt board URL</Label>
                  <Input
                    id="provider-board-url"
                    placeholder="acme.nolt.io"
                    value={boardUrl}
                    onChange={(e) => setBoardUrl(e.target.value)}
                    autoComplete="off"
                  />
                </div>
              ) : null}

              <div className="space-y-1.5">
                <Label htmlFor="provider-api-key">{copy.keyLabel}</Label>
                <Input
                  id="provider-api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  autoComplete="off"
                />
                <p className="text-xs text-accent">{copy.keyHelp} We use it once for this import and don&apos;t store it.</p>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={!canSubmit}>
                  Start import
                </Button>
              </div>
            </div>
          </motion.form>
        )}

        {state === "importing" && (
          <motion.div key="importing" {...stepMotion} aria-live="polite">
            <DataBanner
              busy
              eyebrow={`Importing from ${name}`}
              title="Moving your feedback in"
              description="Large boards can take a few minutes. Keep this window open."
            />
          </motion.div>
        )}

        {state === "success" && (
          <ImportResultSummary result={result} source={name} onDone={() => handleClose(false)} />
        )}

        {state === "error" && (
          <DataErrorStep
            title={`We couldn't import from ${name}`}
            message={error ?? "Failed to import data. Please try again."}
            onRetry={() => setState("idle")}
          />
        )}
      </AnimatePresence>
    </SettingsDialogShell>
  );
}
