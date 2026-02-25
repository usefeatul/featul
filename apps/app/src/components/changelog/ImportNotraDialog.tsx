"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Switch } from "@featul/ui/components/switch";
import { NotraIcon } from "@featul/ui/icons/notra";
import { LoaderIcon } from "@featul/ui/icons/loader";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { NotraSwitchRow } from "@/components/changelog/notra/NotraSwitchRow";

type ImportNotraDialogProps = {
  workspaceSlug: string;
};

type ImportSummary = {
  importedCount: number;
  createdCount: number;
  updatedCount: number;
  skippedCount: number;
  truncatedCount: number;
  limitReached: boolean;
};

type ImportResponse =
  | {
      ok: true;
      summary: ImportSummary;
    }
  | {
      message?: string;
    };

type NotraConnectionResponse = {
  connected: boolean;
  organizationId: string | null;
  canStore: boolean;
};

type MessagePayload = {
  message?: unknown;
};

async function readMessageFromResponse(
  response: Response,
): Promise<string | null> {
  const payload = (await response
    .json()
    .catch(() => null)) as MessagePayload | null;
  const message = payload?.message;
  return typeof message === "string" && message.trim() ? message : null;
}

function showImportSummaryToasts(summary: ImportSummary) {
  toast.success(
    `Synced ${summary.importedCount} entries (${summary.createdCount} created, ${summary.updatedCount} updated).`,
  );
  if (summary.skippedCount > 0) {
    toast.success(`${summary.skippedCount} entries were skipped.`);
  }
  if (summary.truncatedCount > 0) {
    toast.success(
      `${summary.truncatedCount} items were truncated to fit import safety limits.`,
    );
  }
  if (summary.limitReached) {
    toast.error("Changelog entry limit reached for your current plan.");
  }
}

export function ImportNotraDialog({ workspaceSlug }: ImportNotraDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [organizationId, setOrganizationId] = React.useState("");
  const [includeDrafts, setIncludeDrafts] = React.useState(false);
  const [updateExisting, setUpdateExisting] = React.useState(true);
  const [preservePublishStatus, setPreservePublishStatus] =
    React.useState(false);
  const [useStoredConnection, setUseStoredConnection] = React.useState(false);
  const [saveConnection, setSaveConnection] = React.useState(false);
  const [hasStoredConnection, setHasStoredConnection] = React.useState(false);
  const [canStoreConnection, setCanStoreConnection] = React.useState(false);
  const [connectionNotice, setConnectionNotice] = React.useState<string | null>(
    null,
  );
  const [isLoadingConnection, setIsLoadingConnection] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const hasInitializedStoredConnectionPreference = React.useRef(false);
  const apiKeyInputRef = React.useRef<HTMLInputElement | null>(null);

  const clearApiKeyInput = React.useCallback(() => {
    if (apiKeyInputRef.current) {
      apiKeyInputRef.current.value = "";
    }
  }, []);

  const loadConnection = React.useCallback(async () => {
    setIsLoadingConnection(true);
    setConnectionNotice(null);
    try {
      const response = await client.changelog.notraConnectionGet.$get({
        slug: workspaceSlug,
      });
      if (!response.ok) {
        setHasStoredConnection(false);
        setCanStoreConnection(false);
        setConnectionNotice(
          (await readMessageFromResponse(response)) ||
            "Unable to load saved Notra connection status.",
        );
        return;
      }
      const payload = (await response.json()) as NotraConnectionResponse;
      setHasStoredConnection(Boolean(payload.connected));
      setCanStoreConnection(Boolean(payload.canStore));
      if (payload.organizationId) {
        setOrganizationId(payload.organizationId);
      }
      if (!payload.connected) {
        setUseStoredConnection(false);
      } else if (!hasInitializedStoredConnectionPreference.current) {
        setUseStoredConnection(true);
        hasInitializedStoredConnectionPreference.current = true;
      }
      if (!payload.canStore) {
        setConnectionNotice("Encrypted storage is unavailable on this server.");
      }
    } catch {
      setHasStoredConnection(false);
      setCanStoreConnection(false);
      setConnectionNotice("Unable to load saved Notra connection status.");
    } finally {
      setIsLoadingConnection(false);
    }
  }, [workspaceSlug]);

  const closeDialog = React.useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && !isPending) {
        clearApiKeyInput();
        setSaveConnection(false);
      }
      setOpen(nextOpen);
    },
    [clearApiKeyInput, isPending],
  );

  const openDialog = React.useCallback(() => {
    setOpen(true);
    void loadConnection();
  }, [loadConnection]);

  const handleDeleteStoredConnection = React.useCallback(async () => {
    setIsPending(true);
    try {
      const response = await client.changelog.notraConnectionDelete.$post({
        slug: workspaceSlug,
      });
      if (!response.ok) {
        toast.error("Failed to remove saved Notra credentials");
        return;
      }
      setHasStoredConnection(false);
      setUseStoredConnection(false);
      setSaveConnection(false);
      toast.success("Saved Notra credentials removed");
    } catch {
      toast.error("Failed to remove saved Notra credentials");
    } finally {
      setIsPending(false);
    }
  }, [workspaceSlug]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const safeOrganizationId = organizationId.trim();
    const safeApiKey = String(apiKeyInputRef.current?.value || "").trim();

    if (!useStoredConnection) {
      if (!safeOrganizationId) {
        toast.error("Organization ID is required");
        return;
      }
      if (!safeApiKey) {
        toast.error("API key is required");
        return;
      }
    } else if (!hasStoredConnection) {
      toast.error("No saved Notra connection found");
      return;
    }

    setIsPending(true);
    try {
      if (!useStoredConnection && saveConnection) {
        const saveResponse = await client.changelog.notraConnectionSave.$post({
          slug: workspaceSlug,
          organizationId: safeOrganizationId,
          apiKey: safeApiKey,
        });
        if (!saveResponse.ok) {
          toast.error(
            (await readMessageFromResponse(saveResponse)) ||
              "Failed to save Notra credentials",
          );
          return;
        }
        setHasStoredConnection(true);
      }

      const response = await client.changelog.importFromNotra.$post({
        slug: workspaceSlug,
        organizationId: useStoredConnection ? undefined : safeOrganizationId,
        apiKey: useStoredConnection ? undefined : safeApiKey,
        useStoredConnection,
        status: includeDrafts ? ["published", "draft"] : ["published"],
        mode: updateExisting ? "upsert" : "create_only",
        publishBehavior: preservePublishStatus ? "preserve" : "draft_only",
      });

      const payload = (await response
        .json()
        .catch(() => null)) as ImportResponse | null;
      if (!response.ok) {
        toast.error(
          payload && "message" in payload && typeof payload.message === "string"
            ? payload.message
            : "Failed to import from Notra",
        );
        return;
      }

      const summary =
        payload && "ok" in payload && payload.ok ? payload.summary : null;
      if (!summary) {
        toast.error("Notra import completed with an invalid response");
        return;
      }

      showImportSummaryToasts(summary);

      clearApiKeyInput();
      closeDialog(false);
      router.refresh();
    } catch {
      toast.error("Failed to import from Notra");
    } finally {
      setIsPending(false);
    }
  };

  const showStoredConnectionToggle = hasStoredConnection || isLoadingConnection;

  return (
    <>
      <Button
        type="button"
        variant="card"
        className="h-full rounded-none border-none hover:bg-muted px-3 text-xs font-medium text-muted-foreground hover:text-foreground"
        onClick={openDialog}
      >
        <NotraIcon className="size-4 mr-2" />
        Import Notra
      </Button>

      <SettingsDialogShell
        open={open}
        onOpenChange={closeDialog}
        title="Import from Notra"
        icon={<NotraIcon className="size-4" />}
        width="wide"
      >
        <form onSubmit={handleSubmit} className="space-y-4 px-1 pb-1">
          <section className="space-y-2">
            {showStoredConnectionToggle ? (
              <div className="overflow-hidden rounded-md border border-border/70 bg-background">
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground">
                      Use saved connection
                    </p>
                    <p className="text-xs text-accent">
                      Use saved workspace credentials.
                    </p>
                  </div>
                  <Switch
                    checked={useStoredConnection}
                    onCheckedChange={(checked) => {
                      hasInitializedStoredConnectionPreference.current = true;
                      setUseStoredConnection(checked);
                    }}
                    disabled={
                      isPending || isLoadingConnection || !hasStoredConnection
                    }
                  />
                </div>

                <div className="border-t border-border/60 px-3 py-3">
                  {isLoadingConnection ? (
                    <p className="text-xs text-accent">
                      Loading saved connection status...
                    </p>
                  ) : (
                    <p className="text-xs text-accent">
                      Saved org:{" "}
                      <span className="font-mono text-foreground">
                        {organizationId || "Unknown"}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            ) : null}

            {connectionNotice ? (
              <p className="rounded-md border border-amber-400/40 px-2.5 py-2 text-xs text-amber-700 dark:border-amber-300/30 dark:text-amber-300">
                {connectionNotice}
              </p>
            ) : null}
          </section>

          {!useStoredConnection ? (
            <section className="overflow-hidden rounded-md border border-border/70 bg-background">
              <div className="space-y-2 px-3 py-3">
                <label
                  htmlFor="notra-org-id"
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  Organization ID
                </label>
                <Input
                  id="notra-org-id"
                  value={organizationId}
                  onChange={(event) => setOrganizationId(event.target.value)}
                  placeholder="org_123"
                  autoComplete="off"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2 border-t border-border/60 px-3 py-3">
                <label
                  htmlFor="notra-api-key"
                  className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
                >
                  API Key
                </label>
                <Input
                  id="notra-api-key"
                  type="password"
                  placeholder="notra_..."
                  autoComplete="off"
                  disabled={isPending}
                  ref={apiKeyInputRef}
                />
                <p className="text-xs text-accent">
                  Used for this sync unless saved.
                </p>
              </div>
            </section>
          ) : null}

          <section className="overflow-hidden rounded-md border border-border/70 bg-background">
            {!useStoredConnection ? (
              <NotraSwitchRow
                title="Save encrypted connection"
                description="Store credentials for next sync."
                checked={saveConnection}
                onCheckedChange={setSaveConnection}
                disabled={isPending || !canStoreConnection}
              />
            ) : null}

            {!useStoredConnection && !canStoreConnection ? (
              <p className="border-t border-amber-400/30 px-3 py-2 text-xs text-amber-700 dark:border-amber-300/30 dark:text-amber-300">
                Saving encrypted credentials is unavailable in this environment.
              </p>
            ) : null}

            <NotraSwitchRow
              title="Include drafts"
              description="Import draft and published posts."
              checked={includeDrafts}
              onCheckedChange={setIncludeDrafts}
              disabled={isPending}
              withTopBorder={!useStoredConnection}
            />

            <NotraSwitchRow
              title="Update existing imports"
              description="When off, existing imports are skipped."
              checked={updateExisting}
              onCheckedChange={setUpdateExisting}
              disabled={isPending}
              withTopBorder
            />

            <NotraSwitchRow
              title="Preserve published status"
              description="When off, imports stay drafts."
              checked={preservePublishStatus}
              onCheckedChange={setPreservePublishStatus}
              disabled={isPending}
              withTopBorder
            />
          </section>

          <div className="flex items-center justify-between gap-2 pt-2">
            <div>
              {hasStoredConnection ? (
                <Button
                  type="button"
                  variant="nav"
                  onClick={handleDeleteStoredConnection}
                  disabled={isPending}
                  className="text-destructive hover:text-destructive"
                >
                  Remove Connection
                </Button>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="card"
                onClick={() => closeDialog(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending || isLoadingConnection}>
                {isPending ? (
                  <LoaderIcon className="size-4 animate-spin" />
                ) : null}
                Sync Now
              </Button>
            </div>
          </div>
        </form>
      </SettingsDialogShell>
    </>
  );
}

export default ImportNotraDialog;
