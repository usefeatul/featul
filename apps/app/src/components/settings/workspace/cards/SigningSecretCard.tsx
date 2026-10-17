"use client";

import React from "react";
import { WidgetRow } from "./widget";
import { KeyIcon } from "@/components/global/icons";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";

type Props = {
  slug?: string;
};

/** Extract `secret` from the widget signing-secret API body. */
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
      const response = await client.workspace.rotateWidgetSecret.$post({
        slug,
      });
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
      <WidgetRow
        icon={<KeyIcon className="size-5 text-primary" />}
        title="Signing secret"
        description={
          <p className="break-words">
            Use this on your backend to sign user identities for{" "}
            <code className="rounded-lg bg-muted px-1 py-0.5">
              featul.identify()
            </code>
            . Never expose it in browser code.
          </p>
        }
        content={
          <div className="relative w-full">
            <Input
              readOnly
              aria-label="Widget signing secret"
              value={maskedSecret}
              spellCheck={false}
              autoComplete="off"
              className="h-9 w-full pr-16 font-mono"
              onFocus={(event) => {
                if (revealed) event.currentTarget.select();
              }}
            />
            {secret ? (
              <Button
                type="button"
                variant="plain"
                aria-label={
                  revealed ? "Hide signing secret" : "Show signing secret"
                }
                aria-pressed={revealed}
                className="absolute inset-y-1 right-1 h-auto w-12 px-2 text-xs"
                onClick={() => setRevealed((value) => !value)}
              >
                {revealed ? "Hide" : "Show"}
              </Button>
            ) : null}
          </div>
        }
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
      </WidgetRow>

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
