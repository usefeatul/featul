"use client";

import React from "react";
import PlanNotice from "../global/PlanNotice";
import SlackCard from "./SlackCard";
import DiscordCard from "./DiscordCard";
import SuggestIntegrationCard from "./SuggestIntegrationCard";
import ApiKeys from "./ApiKeys";
import GithubSync from "./GithubSync";
import { useIntegrations, type Integration } from "@/hooks/useIntegrations";
import { isIntegrationsAllowed } from "@/lib/plan";

type Props = {
  slug: string;
  plan?: string;
  initialIntegrations?: Integration[];
};

export default function IntegrationsSection({
  slug,
  plan,
  initialIntegrations,
}: Props) {
  const [pendingIntegration, setPendingIntegration] = React.useState<
    string | null
  >(null);
  const allowIntegrations = isIntegrationsAllowed(plan ?? "free");
  const upgradeHref = allowIntegrations
    ? undefined
    : `/workspaces/${slug}/settings/billing`;

  const { isLoading, connect, disconnect, test, getIntegration } =
    useIntegrations({ workspaceSlug: slug, initialData: initialIntegrations });

  const slackIntegration = getIntegration("slack");
  const discordIntegration = getIntegration("discord");
  const slackActionsEnabled = allowIntegrations || Boolean(slackIntegration);
  const discordActionsEnabled =
    allowIntegrations || Boolean(discordIntegration);

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
    <div className="space-y-8">
      <section aria-labelledby="workspace-connections" className="space-y-4">
        <h2
          id="workspace-connections"
          className="px-1 text-sm font-medium leading-6 text-foreground"
        >
          Workspace connections
        </h2>
        <div className="space-y-4">
          <SlackCard
            upgradeHref={upgradeHref}
            integration={slackIntegration}
            onConnect={handleConnectSlack}
            onDisconnect={handleDisconnectSlack}
            onTest={allowIntegrations ? handleTestSlack : undefined}
            isPending={pendingIntegration === "slack"}
            disabled={
              isLoading ||
              (pendingIntegration !== null && pendingIntegration !== "slack") ||
              !slackActionsEnabled
            }
          />
          <DiscordCard
            upgradeHref={upgradeHref}
            integration={discordIntegration}
            onConnect={handleConnectDiscord}
            onDisconnect={handleDisconnectDiscord}
            onTest={allowIntegrations ? handleTestDiscord : undefined}
            isPending={pendingIntegration === "discord"}
            disabled={
              isLoading ||
              (pendingIntegration !== null &&
                pendingIntegration !== "discord") ||
              !discordActionsEnabled
            }
          />
          <GithubSync slug={slug} allowed={allowIntegrations} />
        </div>
      </section>
      <ApiKeys slug={slug} allowed={allowIntegrations} />
      <SuggestIntegrationCard />
      <PlanNotice slug={slug} plan={plan} feature="integrations" />
    </div>
  );
}
