"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { NotraIcon } from "@featul/ui/icons/notra";
import { NotraConnectionSection } from "@/components/changelog/notra/NotraConnectionSection";
import { NotraCredentialsSection } from "@/components/changelog/notra/NotraCredentialsSection";
import { NotraDialogActions } from "@/components/changelog/notra/NotraDialogActions";
import { NotraImportOptionsSection } from "@/components/changelog/notra/NotraImportOptionsSection";
import type {
  ImportResponse,
  NotraConnectionResponse,
} from "@/types/notra";
import {
  readMessageFromResponse,
  showImportSummaryToasts,
} from "@/utils/notra-utils";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";

type ImportNotraDialogProps = {
  workspaceSlug: string;
};

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
  const [canStoreConnection, setCanStoreConnection] = React.useState<
    boolean | null
  >(null);
  const [connectionNotice, setConnectionNotice] = React.useState<string | null>(
    null,
  );
  const [isLoadingConnection, setIsLoadingConnection] = React.useState(false);
  const [hasLoadedConnection, setHasLoadedConnection] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);
  const lastConnectionLoadAt = React.useRef<number | null>(null);
  const latestConnectionRequestId = React.useRef(0);
  const apiKeyInputRef = React.useRef<HTMLInputElement | null>(null);

  const clearApiKeyInput = React.useCallback(() => {
    if (apiKeyInputRef.current) {
      apiKeyInputRef.current.value = "";
    }
  }, []);

  const loadConnection = React.useCallback(async () => {
    const requestId = latestConnectionRequestId.current + 1;
    latestConnectionRequestId.current = requestId;

    setIsLoadingConnection(true);
    setConnectionNotice(null);
    try {
      const response = await client.changelog.notraConnectionGet.$get({
        slug: workspaceSlug,
      });
      if (!response.ok) {
        const message =
          (await readMessageFromResponse(response)) ||
          "Unable to load saved Notra connection status.";
        if (latestConnectionRequestId.current !== requestId) {
          return;
        }
        setHasStoredConnection(false);
        setCanStoreConnection(null);
        setConnectionNotice(message);
        return;
      }
      const payload = (await response.json()) as NotraConnectionResponse;
      if (latestConnectionRequestId.current !== requestId) {
        return;
      }
      setHasStoredConnection(Boolean(payload.connected));
      setCanStoreConnection(Boolean(payload.canStore));
      if (payload.organizationId) {
        setOrganizationId(payload.organizationId);
      }
      if (!payload.connected) {
        setUseStoredConnection(false);
      }
    } catch {
      if (latestConnectionRequestId.current !== requestId) {
        return;
      }
      setHasStoredConnection(false);
      setCanStoreConnection(null);
      setConnectionNotice("Unable to load saved Notra connection status.");
    } finally {
      if (latestConnectionRequestId.current === requestId) {
        setIsLoadingConnection(false);
        setHasLoadedConnection(true);
        lastConnectionLoadAt.current = Date.now();
      }
    }
  }, [workspaceSlug]);

  React.useEffect(() => {
    void loadConnection();
  }, [loadConnection]);

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
    const shouldRefresh =
      !hasLoadedConnection ||
      !lastConnectionLoadAt.current ||
      Date.now() - lastConnectionLoadAt.current > 60_000;
    if (shouldRefresh && !isLoadingConnection) {
      void loadConnection();
    }
  }, [hasLoadedConnection, isLoadingConnection, loadConnection]);

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
    const shouldUseStoredConnection = useStoredConnection && hasStoredConnection;

    if (!shouldUseStoredConnection) {
      if (!safeOrganizationId) {
        toast.error("Organization ID is required");
        return;
      }
      if (!safeApiKey) {
        toast.error("API key is required");
        return;
      }
    }

    setIsPending(true);
    try {
      if (!shouldUseStoredConnection && saveConnection) {
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
        organizationId: shouldUseStoredConnection ? undefined : safeOrganizationId,
        apiKey: shouldUseStoredConnection ? undefined : safeApiKey,
        useStoredConnection: shouldUseStoredConnection,
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

  const saveConnectionDescription =
    hasLoadedConnection && canStoreConnection === false
      ? "Unavailable on this server."
      : "Store credentials for next sync.";
  const isInitialConnectionLoad = isLoadingConnection && !hasLoadedConnection;
  const isUsingStoredConnection = useStoredConnection && hasStoredConnection;

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
          <NotraConnectionSection
            hasStoredConnection={hasStoredConnection}
            isUsingStoredConnection={isUsingStoredConnection}
            isSwitchDisabled={
              isPending || isInitialConnectionLoad || !hasStoredConnection
            }
            isLoadingConnection={isLoadingConnection}
            organizationId={organizationId}
            connectionNotice={connectionNotice}
            showConnectionNotice={hasLoadedConnection}
            onUseStoredConnectionChange={setUseStoredConnection}
          />

          {!isUsingStoredConnection ? (
            <NotraCredentialsSection
              organizationId={organizationId}
              onOrganizationIdChange={setOrganizationId}
              isPending={isPending}
              apiKeyInputRef={apiKeyInputRef}
            />
          ) : null}

          <NotraImportOptionsSection
            isUsingStoredConnection={isUsingStoredConnection}
            saveConnectionDescription={saveConnectionDescription}
            saveConnection={saveConnection}
            onSaveConnectionChange={setSaveConnection}
            isSaveConnectionDisabled={
              isPending || isInitialConnectionLoad || canStoreConnection !== true
            }
            includeDrafts={includeDrafts}
            onIncludeDraftsChange={setIncludeDrafts}
            updateExisting={updateExisting}
            onUpdateExistingChange={setUpdateExisting}
            preservePublishStatus={preservePublishStatus}
            onPreservePublishStatusChange={setPreservePublishStatus}
            isPending={isPending}
          />

          <NotraDialogActions
            hasStoredConnection={hasStoredConnection}
            isPending={isPending}
            isSubmitDisabled={isPending || isInitialConnectionLoad}
            onDeleteStoredConnection={handleDeleteStoredConnection}
            onCancel={() => closeDialog(false)}
          />
        </form>
      </SettingsDialogShell>
    </>
  );
}

export default ImportNotraDialog;
