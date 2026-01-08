import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { CsvIcon } from "@featul/ui/icons/csv";

type Props = {
  onImport?: () => void;
};

export default function ImportFromCSV({ onImport }: Props) {
  return (
    <SettingsCard
      icon={<CsvIcon className="w-5 h-5" />}
      title="Import from CSV"
      description="Import your feature requests, boards, and users from a CSV file."
      buttonLabel="Import"
      onAction={onImport}
    />
  );
}
