import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { ProductBoardIcon } from "@featul/ui/icons/productboard";

type Props = {
  onImport?: () => void;
};

export default function ImportFromProductBoard({ onImport }: Props) {
  return (
    <SettingsCard
      icon={<ProductBoardIcon className="w-5 h-5" />}
      title="Import from ProductBoard"
      description="Import your posts, boards, and comments directly from ProductBoard."
      buttonLabel="Import"
      onAction={onImport}
    />
  );
}
