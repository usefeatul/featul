import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { ProductRoadIcon } from "@featul/ui/icons/productroad";

type Props = {
  onImport?: () => void;
};

export default function ImportFromProductRoad({ onImport }: Props) {
  return (
    <SettingsCard
      icon={<ProductRoadIcon className="w-5 h-5" />}
      title="Import from ProductRoad"
      description="Import your posts, boards, and comments directly from ProductRoad."
      buttonLabel="Import"
      onAction={onImport}
    />
  );
}
