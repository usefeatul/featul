"use client";

import React from "react";
import { DiscordIcon } from "@featul/ui/icons/discord";
import type { Integration } from "@/hooks/useIntegrations";
import WebhookIntegrationCard from "./WebhookIntegrationCard";

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
  return (
    <WebhookIntegrationCard
      type="discord"
      title="Discord"
      icon={<DiscordIcon className="w-5 h-5" />}
      connectedDescription="Connected! You'll receive notifications in your Discord channel when new submissions are posted."
      disconnectedDescription="Connect your Discord server to get notified when a new request is submitted."
      integration={integration}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onTest={onTest}
      isPending={isPending}
      disabled={disabled}
    />
  );
}
