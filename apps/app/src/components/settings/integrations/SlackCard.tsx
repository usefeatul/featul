"use client";

import React from "react";
import { SlackIcon } from "@featul/ui/icons/slack";
import type { Integration } from "@/hooks/useIntegrations";
import WebhookIntegrationCard from "./WebhookIntegrationCard";

interface SlackCardProps {
  integration?: Integration;
  onConnect?: (webhookUrl: string) => Promise<boolean>;
  onDisconnect?: () => Promise<boolean>;
  onTest?: () => Promise<boolean>;
  isPending?: boolean;
  disabled?: boolean;
}

/**
 * Slack integration card with connect/disconnect functionality
 */
export default function SlackCard({
  integration,
  onConnect,
  onDisconnect,
  onTest,
  isPending = false,
  disabled = false,
}: SlackCardProps) {
  return (
    <WebhookIntegrationCard
      type="slack"
      title="Slack"
      icon={<SlackIcon className="w-5 h-5" />}
      connectedDescription="Connected! You'll receive notifications in your Slack channel when new submissions are posted."
      disconnectedDescription="Connect your Slack workspace to get notified when a new request is submitted."
      integration={integration}
      onConnect={onConnect}
      onDisconnect={onDisconnect}
      onTest={onTest}
      isPending={isPending}
      disabled={disabled}
    />
  );
}
