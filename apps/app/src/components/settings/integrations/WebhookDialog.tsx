"use client";

import React, { useState } from "react";
import { SettingsDialogShell } from "../global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { Input } from "@featul/ui/components/input";
import { DiscordIcon } from "@featul/ui/icons/discord";
import { SlackIcon } from "@featul/ui/icons/slack";
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
  const IntegrationIcon = type === "discord" ? DiscordIcon : SlackIcon;

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
          ? "Invalid Discord webhook URL"
          : "Invalid Slack webhook URL"
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
    <SettingsDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title={`Connect ${integrationName}`}
      icon={<IntegrationIcon className="w-4 h-4" />}
      width="default"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          <p className="text-sm text-accent">
            Enter your {integrationName} webhook URL to receive notifications when new submissions are posted.
          </p>
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
            className="font-mono text-sm placeholder:text-accent"
          />
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="card"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending || !webhookUrl.trim()}>
            {isPending ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </form>
    </SettingsDialogShell>
  );
}
