import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { NoltIcon } from "@featul/ui/icons/nolt";

type Props = {
  onImport?: () => void;
  allowImport?: boolean;
};

export default function ImportFromNolt({
  onImport,
  allowImport = false,
}: Props) {
  return (
    <SettingsCard
      icon={<NoltIcon className="w-5 h-5" />}
      title="Import from Nolt"
      description={
        allowImport
          ? "Import your feedback, feature requests, and comments directly from Nolt. Coming soon."
          : "Import your feedback, feature requests, and comments directly from Nolt. Paid plans only. Coming soon."
      }
      buttonLabel={allowImport ? "Soon" : "Paid (Soon)"}
      onAction={onImport}
      disabled
    />
  );
}
