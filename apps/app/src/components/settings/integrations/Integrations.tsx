"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import PlanNotice from "../global/PlanNotice";
import SlackCard from "./SlackCard";
import DiscordCard from "./DiscordCard";
import SuggestIntegrationCard from "./SuggestIntegrationCard";
import { useIntegrations } from "@/hooks/useIntegrations";

type Props = {
  slug: string;
  plan?: string;
};

/**
 * Integrations settings section with Discord and Slack webhook support
 */
export default function IntegrationsSection({ slug, plan }: Props) {
  const {
    integrations,
    isLoading,
    isPending,
    connect,
    disconnect,
    test,
    getIntegration,
  } = useIntegrations({ workspaceSlug: slug });

  const handleConnectDiscord = async (webhookUrl: string) => {
    return await connect("discord", webhookUrl);
  };

  const handleConnectSlack = async (webhookUrl: string) => {
    return await connect("slack", webhookUrl);
  };

  const handleDisconnectDiscord = async () => {
    return await disconnect("discord");
  };

  const handleDisconnectSlack = async () => {
    return await disconnect("slack");
  };

  const handleTestDiscord = async () => {
    return await test("discord");
  };

  const handleTestSlack = async () => {
    return await test("slack");
  };

  return (
    <SectionCard
      title="Available Integrations"
      description="Connect your integrations here."
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SlackCard
          integration={getIntegration("slack")}
          onConnect={handleConnectSlack}
          onDisconnect={handleDisconnectSlack}
          onTest={handleTestSlack}
          isPending={isPending}
          disabled={isLoading}
        />
        <DiscordCard
          integration={getIntegration("discord")}
          onConnect={handleConnectDiscord}
          onDisconnect={handleDisconnectDiscord}
          onTest={handleTestDiscord}
          isPending={isPending}
          disabled={isLoading}
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
