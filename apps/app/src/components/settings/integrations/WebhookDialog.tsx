"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@featul/ui/components/dialog";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { Label } from "@featul/ui/components/label";
import type { IntegrationType } from "@/hooks/useIntegrations";

interface WebhookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: IntegrationType;
  onConnect: (webhookUrl: string) => Promise<boolean>;
  isPending?: boolean;
}

/**
 * Dialog for connecting a Discord or Slack webhook
 */
export default function WebhookDialog({
  open,
  onOpenChange,
  type,
  onConnect,
  isPending = false,
}: WebhookDialogProps) {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [error, setError] = useState<string | null>(null);

  const integrationName = type === "discord" ? "Discord" : "Slack";

  const validateUrl = (url: string): boolean => {
    if (type === "discord") {
      return /^https:\/\/discord\.com\/api\/webhooks\/\d+\/[\w-]+$/.test(url);
    } else if (type === "slack") {
      return /^https:\/\/hooks\.slack\.com\/services\/[\w-]+\/[\w-]+\/[\w-]+$/.test(url);
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!webhookUrl.trim()) {
      setError("Webhook URL is required");
      return;
    }

    if (!validateUrl(webhookUrl)) {
      setError(
        type === "discord"
          ? "Invalid Discord webhook URL. It should look like: https://discord.com/api/webhooks/..."
          : "Invalid Slack webhook URL. It should look like: https://hooks.slack.com/services/..."
      );
      return;
    }

    const success = await onConnect(webhookUrl);
    if (success) {
      setWebhookUrl("");
      setError(null);
      onOpenChange(false);
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setWebhookUrl("");
      setError(null);
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect {integrationName}</DialogTitle>
          <DialogDescription>
            Enter your {integrationName} webhook URL to receive notifications when new
            submissions are posted.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder={
                  type === "discord"
                    ? "https://discord.com/api/webhooks/..."
                    : "https://hooks.slack.com/services/..."
                }
                value={webhookUrl}
                onChange={(e) => {
                  setWebhookUrl(e.target.value);
                  setError(null);
                }}
                className="font-mono text-sm"
              />
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
            </div>

            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium">How to get your webhook URL:</p>
              {type === "discord" ? (
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to your Discord server settings</li>
                  <li>Navigate to Integrations → Webhooks</li>
                  <li>Click "New Webhook" and configure it</li>
                  <li>Copy the webhook URL</li>
                </ol>
              ) : (
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Go to api.slack.com/apps</li>
                  <li>Create or select an app for your workspace</li>
                  <li>Enable Incoming Webhooks</li>
                  <li>Add a new webhook to your channel</li>
                </ol>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || !webhookUrl.trim()}>
              {isPending ? "Connecting..." : "Connect"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
