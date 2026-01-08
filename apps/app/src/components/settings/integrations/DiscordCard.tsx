import React from "react";
import SettingsCard from "../../global/SettingsCard";
import { CommentsIcon } from "@featul/ui/icons/comments";

type Props = {
  onConnect?: () => void;
};

export default function DiscordCard({ onConnect }: Props) {
  // Using CommentsIcon as a placeholder for Discord if DiscordIcon is not available, based on previous implementation
  // Ideally, we should check if DiscordIcon exists or stick to what was used (CommentsIcon)
  return (
    <SettingsCard
      icon={<CommentsIcon className="w-5 h-5" />}
      title="Discord"
      description="Connect your Discord server to get notified when a new request is submitted."
      buttonLabel="Connect"
      onAction={onConnect}
      disabled
    />
  );
}
