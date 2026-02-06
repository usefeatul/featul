"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import SlackCard from "./SlackCard";
import DiscordCard from "./DiscordCard";
import SuggestIntegrationCard from "./SuggestIntegrationCard";
import { useIntegrations, type Integration } from "@/hooks/useIntegrations";
import { isIntegrationsAllowed } from "@/lib/plan";

type Props = {
  slug: string;
  plan?: string;
  initialIntegrations?: Integration[];
};

/**
 * Integrations settings section with Discord and Slack webhook support
 */
export default function IntegrationsSection({ slug, plan, initialIntegrations }: Props) {
  const [pendingIntegration, setPendingIntegration] = React.useState<string | null>(null);
  const allowIntegrations = isIntegrationsAllowed(plan ?? "free");

  const {
    isLoading,
    connect,
    disconnect,
    test,
    getIntegration,
  } = useIntegrations({ workspaceSlug: slug, initialData: initialIntegrations });

  const slackIntegration = getIntegration("slack");
  const discordIntegration = getIntegration("discord");
  const slackActionsEnabled = allowIntegrations || Boolean(slackIntegration);
  const discordActionsEnabled = allowIntegrations || Boolean(discordIntegration);

  const handleConnectDiscord = async (webhookUrl: string) => {
    setPendingIntegration("discord");
    try {
      return await connect("discord", webhookUrl);
    } finally {
      setPendingIntegration(null);
    }
  };

  const handleConnectSlack = async (webhookUrl: string) => {
    setPendingIntegration("slack");
    try {
      return await connect("slack", webhookUrl);
    } finally {
      setPendingIntegration(null);
    }
  };

  const handleDisconnectDiscord = async () => {
    setPendingIntegration("discord");
    try {
      return await disconnect("discord");
    } finally {
      setPendingIntegration(null);
    }
  };

  const handleDisconnectSlack = async () => {
    setPendingIntegration("slack");
    try {
      return await disconnect("slack");
    } finally {
      setPendingIntegration(null);
    }
  };

  const handleTestDiscord = async () => {
    setPendingIntegration("discord");
    try {
      return await test("discord");
    } finally {
      setPendingIntegration(null);
    }
  };

  const handleTestSlack = async () => {
    setPendingIntegration("slack");
    try {
      return await test("slack");
    } finally {
      setPendingIntegration(null);
    }
  };

  return (
    <SectionCard
      title="Available Integrations"
      description="Connect your integrations here."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SlackCard
          integration={slackIntegration}
          onConnect={handleConnectSlack}
          onDisconnect={handleDisconnectSlack}
          onTest={allowIntegrations ? handleTestSlack : undefined}
          isPending={pendingIntegration === "slack"}
          disabled={
            isLoading
            || (pendingIntegration !== null && pendingIntegration !== "slack")
            || !slackActionsEnabled
          }
        />
        <DiscordCard
          integration={discordIntegration}
          onConnect={handleConnectDiscord}
          onDisconnect={handleDisconnectDiscord}
          onTest={allowIntegrations ? handleTestDiscord : undefined}
          isPending={pendingIntegration === "discord"}
          disabled={
            isLoading
            || (pendingIntegration !== null && pendingIntegration !== "discord")
            || !discordActionsEnabled
          }
        />
        <div className="md:col-span-1">
          <SuggestIntegrationCard />
        </div>
      </div>

      <div className="mt-4">
        <PlanNotice slug={slug} plan={plan} feature="integrations" />
      </div>
    </SectionCard>
  );
}
