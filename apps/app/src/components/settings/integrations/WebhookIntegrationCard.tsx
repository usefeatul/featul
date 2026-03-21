"use client";

import React, { useState } from "react";
import type { ReactNode } from "react";
import type { Integration } from "@/hooks/useIntegrations";
import type { IntegrationType } from "@/hooks/useIntegrations";
import SettingsCard from "../../global/SettingsCard";
import WebhookDialog from "./WebhookDialog";

type WebhookIntegrationCardProps = {
  type: IntegrationType;
  title: string;
  icon: ReactNode;
  connectedDescription: string;
  disconnectedDescription: string;
  integration?: Integration;
  onConnect?: (webhookUrl: string) => Promise<boolean>;
  onDisconnect?: () => Promise<boolean>;
  onTest?: () => Promise<boolean>;
  isPending?: boolean;
  disabled?: boolean;
};

export default function WebhookIntegrationCard({
  type,
  title,
  icon,
  connectedDescription,
  disconnectedDescription,
  integration,
  onConnect,
  onDisconnect,
  onTest,
  isPending = false,
  disabled = false,
}: WebhookIntegrationCardProps) {
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
        icon={icon}
        title={title}
        description={
          isConnected ? connectedDescription : disconnectedDescription
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
        type={type}
        onConnect={handleConnect}
        isPending={isPending}
      />
    </>
  );
}
