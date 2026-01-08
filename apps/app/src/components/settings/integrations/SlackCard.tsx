import React from "react";
import SettingsCard from "../../global/SettingsCard";
import { SlackIcon } from "@featul/ui/icons/slack";

type Props = {
  onConnect?: () => void;
};

export default function SlackCard({ onConnect }: Props) {
  return (
    <SettingsCard
      icon={<SlackIcon className="w-5 h-5" />}
      title="Slack"
      description="Connect your Slack workspace to get notified when a new request is submitted."
      buttonLabel="Connect"
      onAction={onConnect}
      disabled
    />
  );
}
