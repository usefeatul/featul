import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { NoltIcon } from "@featul/ui/icons/nolt";

type Props = {
  onImport?: () => void;
};

export default function ImportFromNolt({ onImport }: Props) {
  return (
    <SettingsCard
      icon={<NoltIcon className="w-5 h-5" />}
      title="Import from Nolt"
      description="Import your feedback, feature requests, and comments directly from Nolt."
      buttonLabel="Import"
      onAction={onImport}
    />
  );
}
