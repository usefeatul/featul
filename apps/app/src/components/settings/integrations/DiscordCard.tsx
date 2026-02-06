"use client";

import React, { useState } from "react";
import SettingsCard from "../../global/SettingsCard";
import { DiscordIcon } from "@featul/ui/icons/discord";
import WebhookDialog from "./WebhookDialog";
import type { Integration } from "@/hooks/useIntegrations";

interface DiscordCardProps {
  integration?: Integration;
  onConnect?: (webhookUrl: string) => Promise<boolean>;
  onDisconnect?: () => Promise<boolean>;
  onTest?: () => Promise<boolean>;
  isPending?: boolean;
  disabled?: boolean;
}

/**
 * Discord integration card with connect/disconnect functionality
 */
export default function DiscordCard({
  integration,
  onConnect,
  onDisconnect,
  onTest,
  isPending = false,
  disabled = false,
}: DiscordCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const isConnected = !!integration;

  const handleConnect = async (webhookUrl: string): Promise<boolean> => {
    if (onConnect) {
      return await onConnect(webhookUrl);
    }
    return false;
  };

  const handleAction = () => {
    if (isConnected && onDisconnect) {
      onDisconnect();
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <SettingsCard
        icon={<DiscordIcon className="w-5 h-5" />}
        title="Discord"
        description={
          isConnected
            ? "Connected! You'll receive notifications in your Discord channel when new submissions are posted."
            : "Connect your Discord server to get notified when a new request is submitted."
        }
        buttonLabel={isConnected ? "Disconnect" : "Connect"}
        onAction={handleAction}
        isLoading={isPending}
        disabled={disabled || isPending}
        isConnected={isConnected}
        onTest={isConnected && onTest ? onTest : undefined}
      />

      <WebhookDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        type="discord"
        onConnect={handleConnect}
        isPending={isPending}
      />
    </>
  );
}
