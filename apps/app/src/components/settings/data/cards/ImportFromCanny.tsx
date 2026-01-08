import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { CannyIcon } from "@featul/ui/icons/canny";

type Props = {
  onImport?: () => void;
};

export default function ImportFromCanny({ onImport }: Props) {
  return (
    <SettingsCard
      icon={<CannyIcon className="w-5 h-5" />}
      title="Import from Canny"
      description="Import your feedback, feature requests, and comments directly from Canny."
      buttonLabel="Import"
      onAction={onImport}
    />
  );
}
