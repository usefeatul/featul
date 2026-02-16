import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";

type Props = {
  onImport?: () => void;
  allowImport?: boolean;
};

export default function ImportFromProductBoard({
  onImport,
  allowImport = false,
}: Props) {
  return (
    <SettingsCard
      icon={<ProductBoardIcon className="w-5 h-5" />}
      title="Import from ProductBoard"
      description={
        allowImport
          ? "Import your posts, boards, and comments directly from ProductBoard. Coming soon."
          : "Import your posts, boards, and comments directly from ProductBoard. Paid plans only. Coming soon."
      }
      buttonLabel={allowImport ? "Soon" : "Paid (Soon)"}
      onAction={onImport}
      disabled
    />
  );
}
