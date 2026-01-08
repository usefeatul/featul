import React from "react";
import SettingsCard from "../../global/SettingsCard";
import { ShieldIcon } from "@featul/ui/icons/shield";

type Props = {
  onSuggest?: () => void;
};

export default function SuggestIntegrationCard({ onSuggest }: Props) {
  return (
    <SettingsCard
      icon={<ShieldIcon className="w-5 h-5" />}
      title="Integrations?"
      description="Tell us what integrations would help improve your workflow."
      buttonLabel="Suggest Integration"
      onAction={onSuggest}
    />
  );
}
