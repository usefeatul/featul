import React from "react";
import SettingsCard from "../../global/SettingsCard";
import { IntegrationIcon } from "@featul/ui/icons/integration";

type Props = {
  onSuggest?: () => void;
};

export default function SuggestIntegrationCard({ onSuggest: _onSuggest }: Props) {
  return (
    <SettingsCard
      icon={<IntegrationIcon className="size-5 text-primary" />}
      title="Integrations?"
      description="Tell us what integrations would help improve your workflow."
      buttonLabel="Suggest Integration"
      href="https://feedback.featul.com"
    />
  );
}
