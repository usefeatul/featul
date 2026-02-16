import React from "react";
import ImportFromCSV from "./cards/ImportFromCSV";
import ImportFromCanny from "./cards/ImportFromCanny";
import ImportFromProductBoard from "./cards/ImportFromProductBoard";
import ImportFromNolt from "./cards/ImportFromNolt";
import { isDataImportsAllowed } from "@/lib/plan";

type Props = {
  plan?: string;
};

export default function DataImportSection({ plan }: Props) {
  const allowProviderImports = isDataImportsAllowed(plan ?? "free");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ImportFromCSV />
      <ImportFromCanny allowImport={allowProviderImports} />
      <ImportFromProductBoard allowImport={allowProviderImports} />
      <ImportFromNolt allowImport={allowProviderImports} />
    </div>
  );
}
