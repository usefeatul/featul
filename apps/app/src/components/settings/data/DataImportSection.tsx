"use client";

import React from "react";
import ImportFromCSV from "./cards/ImportFromCSV";
import ImportFromCanny from "./cards/ImportFromCanny";
import ImportFromProductBoard from "./cards/ImportFromProductBoard";
import ImportFromNolt from "./cards/ImportFromNolt";
import { isDataImportsAllowed } from "@/lib/plan";
import { ImportDialog } from "./ImportDialog";

type Props = {
  slug: string;
  plan?: string;
};

export default function DataImportSection({ slug, plan }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const allowProviderImports = isDataImportsAllowed(plan ?? "free");

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ImportFromCSV onImport={() => setDialogOpen(true)} />
        <ImportFromCanny allowImport={allowProviderImports} />
        <ImportFromProductBoard allowImport={allowProviderImports} />
        <ImportFromNolt allowImport={allowProviderImports} />
      </div>
      <ImportDialog slug={slug} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
