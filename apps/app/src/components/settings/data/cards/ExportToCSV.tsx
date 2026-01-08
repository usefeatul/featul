import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { FileExportIcon } from "@featul/ui/icons/file-export";

type Props = {
  onExport?: () => void;
};

export default function ExportToCSV({ onExport }: Props) {
  return (
    <SettingsCard
      icon={<FileExportIcon className="w-5 h-5" />}
      title="Export to CSV"
      description="Export all your feedback submissions and their details to a downloadable CSV file."
      buttonLabel="Export"
      onAction={onExport}
    />
  );
}
