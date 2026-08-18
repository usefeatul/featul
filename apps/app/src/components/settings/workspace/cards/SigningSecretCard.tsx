"use client";

import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { KeyIcon } from "@featul/ui/icons/key";
import { Button } from "@featul/ui/components/button";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";

type Props = {
  slug?: string;
};

function readSecret(data: unknown) {
  if (!data || typeof data !== "object" || !("secret" in data)) return null;
  const secret = (data as { secret?: unknown }).secret;
  return typeof secret === "string" ? secret : null;
}

export default function SigningSecretCard({ slug }: Props) {
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
    <div className="h-full">
      <SettingsCard
        icon={<KeyIcon className="size-5 text-primary" />}
        title="Signing secret"
        description={
          <div className="space-y-3">
            <p className="break-words">
              Use this on your backend to sign user identities for{" "}
              <code className="rounded bg-muted px-1 py-0.5">
                featul.identify()
              </code>
              . Never expose it in browser code.
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
          </div>
        }
        disabled={!slug}
      >
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
    </div>
  );
}
