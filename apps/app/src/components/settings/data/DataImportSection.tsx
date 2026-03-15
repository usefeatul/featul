"use client";

import React from "react";
import SettingsCard from "@/components/global/SettingsCard";
import { isDataImportsAllowed } from "@/lib/plan";
import { ImportDialog } from "./ImportDialog";
import { importCardConfigs, type DataCardAction } from "./cards/config";

type Props = {
  slug: string;
  plan?: string;
};

export default function DataImportSection({ slug, plan }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const allowProviderImports = isDataImportsAllowed(plan ?? "free");
  const context = React.useMemo(
    () => ({ allowProviderImports }),
    [allowProviderImports]
  );

  const onCardAction = React.useCallback((action: DataCardAction) => {
    if (action === "openImportDialog") {
      setDialogOpen(true);
    }
  }, []);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {importCardConfigs.map((card) => {
          const Icon = card.icon;
          return (
            <SettingsCard
              key={card.id}
              icon={<Icon className={card.iconClassName} />}
              title={card.title}
              description={card.description(context)}
              buttonLabel={card.buttonLabel(context)}
              onAction={() => onCardAction(card.action)}
              disabled={Boolean(card.disabled)}
            />
          );
        })}
      </div>
      <ImportDialog slug={slug} open={dialogOpen} onOpenChange={setDialogOpen} />
    </>
  );
}
