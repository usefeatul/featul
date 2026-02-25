import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { CannyIcon } from "@featul/ui/icons/canny";

type Props = {
  onImport?: () => void;
  allowImport?: boolean;
};

export default function ImportFromCanny({
  onImport,
  allowImport = false,
}: Props) {
  return (
    <SettingsCard
      icon={<CannyIcon className="w-5 h-5" />}
      title="Import from Canny"
      description={
        allowImport
          ? "Import your feedback, feature requests, and comments directly from Canny. Coming soon."
          : "Import your feedback, feature requests, and comments directly from Canny. Paid plans only. Coming soon."
      }
      buttonLabel={allowImport ? "Soon" : "Paid (Soon)"}
      onAction={onImport}
      disabled
    />
  );
}
