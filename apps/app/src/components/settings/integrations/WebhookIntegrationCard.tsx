"use client";

import React, { useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";
import type { Integration } from "@/hooks/useIntegrations";
import type { IntegrationType } from "@/hooks/useIntegrations";
import SectionCard, { type SectionCardStatus } from "../global/SectionCard";
import { Button } from "@featul/ui/components/button";
import { LoaderIcon } from "@/components/global/icons";
import WebhookDialog from "./WebhookDialog";

type WebhookIntegrationCardProps = {
  upgradeHref?: string;
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
  upgradeHref,
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
  const status: SectionCardStatus = isPending
    ? {
        tone: "info",
        label: "In progress",
        message: `Your ${title} request is in progress. Please wait.`,
      }
    : upgradeHref
      ? {
          tone: "neutral",
          label: "Upgrade required",
          message: `Upgrade to Starter or Professional to use ${title} notifications.`,
        }
      : isConnected
        ? {
            tone: "success",
            label: "Connected",
            message: `${title} is connected. New submission notifications are enabled.`,
          }
        : {
            tone: "warning",
            label: "Action needed",
            message: `Add a ${title} webhook URL to start receiving notifications.`,
          };

  const handleConnect = async (webhookUrl: string): Promise<boolean> => {
    if (!upgradeHref && onConnect) {
      return await onConnect(webhookUrl);
    }
    return false;
  };

  const handleAction = () => {
    if (isConnected && onDisconnect) {
      onDisconnect();
    } else if (!upgradeHref) {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <SectionCard
        icon={icon}
        title={title}
        description={
          upgradeHref
            ? `Receive new submission notifications in ${title} on a paid plan.`
            : isConnected
              ? connectedDescription
              : disconnectedDescription
        }
        status={status}
        action={
          <div className="flex flex-wrap items-center gap-2">
            {isConnected && onTest && !upgradeHref ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onTest}
                disabled={disabled || isPending}
              >
                Test
              </Button>
            ) : null}
            {isConnected || !upgradeHref ? (
              <Button
                variant="card"
                size="sm"
                onClick={handleAction}
                disabled={disabled || isPending}
                aria-busy={isPending}
              >
                {isPending ? <LoaderIcon size={16} /> : null}
                {isConnected ? "Disconnect" : "Connect"}
              </Button>
            ) : null}
            {upgradeHref ? (
              <Button asChild variant="card" size="sm">
                <Link href={upgradeHref}>Upgrade plan</Link>
              </Button>
            ) : null}
          </div>
        }
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
