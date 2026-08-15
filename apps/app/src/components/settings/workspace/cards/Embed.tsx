"use client";

import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { ClipboardIcon as Clipboard } from "@featul/ui/icons/clipboard";
import { Button } from "@featul/ui/components/button";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";

type Props = {
  workspaceId?: string;
  slug?: string;
};

function readSecret(data: unknown) {
  if (!data || typeof data !== "object" || !("secret" in data)) return null;
  const secret = (data as { secret?: unknown }).secret;
  return typeof secret === "string" ? secret : null;
}

export default function EmbedCard({ workspaceId, slug }: Props) {
  const [secret, setSecret] = React.useState<string | null>(null);
  const [loadingSecret, setLoadingSecret] = React.useState(false);
  const [revealed, setRevealed] = React.useState(false);
  const [rotating, setRotating] = React.useState(false);
  const [rotateDialogOpen, setRotateDialogOpen] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;
    let canceled = false;
    setLoadingSecret(true);
    client.workspace.widgetSecret
      .$get({ slug })
      .then((res) => res.json())
      .then((data) => {
        if (!canceled) setSecret(readSecret(data));
      })
      .catch(() => {
        if (!canceled) toast.error("Could not load signing secret");
      })
      .finally(() => {
        if (!canceled) setLoadingSecret(false);
      });
    return () => {
      canceled = true;
    };
  }, [slug]);

  const snippet = React.useMemo(() => {
    const appUrl =
      typeof window === "undefined"
        ? "https://app.featul.com"
        : window.location.origin;
    return `<script>
  window.$featulq = window.$featulq || [];
  window.featul = window.featul || new Proxy({}, {
    get: (_, method) => (...args) => window.$featulq.push([method, ...args])
  });
</script>
<script async src="${appUrl}/widget/sdk/v1.js"></script>
<script>
  featul.init("${workspaceId || "YOUR_WORKSPACE_ID"}", {
    widget: true,
    theme: "auto",
    position: "right"
  });
</script>`;
  }, [workspaceId]);

  const handleCopyId = () => {
    if (!workspaceId) return;
    navigator.clipboard.writeText(workspaceId);
    toast.success("Workspace ID copied");
  };

  const handleCopySnippet = () => {
    if (!workspaceId) return;
    navigator.clipboard.writeText(snippet);
    toast.success("Widget snippet copied");
  };

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    toast.success("Signing secret copied");
  };

  const handleRotateSecret = async () => {
    if (!slug) return;
    setRotating(true);
    try {
      const response = await client.workspace.rotateWidgetSecret.$post({ slug });
      const data = await response.json();
      const nextSecret = readSecret(data);
      if (!nextSecret) throw new Error("Missing secret");
      setSecret(nextSecret);
      setRevealed(true);
      setRotateDialogOpen(false);
      toast.success("Signing secret rotated");
    } catch {
      toast.error("Could not rotate signing secret");
    } finally {
      setRotating(false);
    }
  };

  const maskedSecret = secret
    ? revealed
      ? secret
      : `••••••••••••${secret.slice(-4)}`
    : loadingSecret
      ? "Loading…"
      : "Unavailable";

  return (
    <>
      <SettingsCard
        icon={<Clipboard className="size-5 text-primary" />}
        title="Embed widget"
        description={
          <div className="space-y-3">
            <p className="break-words">
              Copy the snippet into your app. Featul automatically trusts your
              workspace domain and verified custom domains — no extra setup
              required.
            </p>
            <p className="break-all text-sm text-muted-foreground">
              Workspace ID:{" "}
              <span className="font-semibold text-foreground">
                {workspaceId || "N/A"}
              </span>
            </p>
            <div className="space-y-1.5">
              <p className="text-sm text-muted-foreground">
                Signing secret{" "}
                <span className="text-xs">(server-side only)</span>
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <code className="break-all rounded-md border border-border bg-muted/40 px-2 py-1 text-xs text-foreground">
                  {maskedSecret}
                </code>
                {secret ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => setRevealed((value) => !value)}
                  >
                    {revealed ? "Hide" : "Show"}
                  </Button>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground">
                Use this on your backend to sign user identities for{" "}
                <code className="rounded bg-muted px-1 py-0.5">
                  featul.identify()
                </code>
                . Never expose it in browser code or the embed snippet.
              </p>
            </div>
            <pre className="max-h-44 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
              <code>{snippet}</code>
            </pre>
          </div>
        }
        disabled={!workspaceId}
      >
        <Button variant="card" onClick={handleCopyId} disabled={!workspaceId}>
          Copy ID
        </Button>
        <Button variant="card" onClick={handleCopySecret} disabled={!secret}>
          Copy secret
        </Button>
        <Button
          variant="card"
          onClick={() => setRotateDialogOpen(true)}
          disabled={!slug || !secret || rotating}
        >
          Rotate secret
        </Button>
        <Button onClick={handleCopySnippet} disabled={!workspaceId}>
          Copy snippet
        </Button>
      </SettingsCard>

      <DestructiveConfirmDialog
        open={rotateDialogOpen}
        onOpenChange={setRotateDialogOpen}
        isPending={rotating}
        onConfirm={handleRotateSecret}
        title="Rotate signing secret?"
        description="Existing signed identities will stop working until you update FEATUL_WIDGET_SECRET on your server. Continue?"
        confirmLabel="Rotate secret"
        pendingLabel="Rotating…"
        confirmClassName="h-8 bg-amber-600 px-4 text-sm text-white hover:bg-amber-700"
      />
    </>
  );
}
