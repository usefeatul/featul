"use client";

import React from "react";
import SettingsCard from "@/components/global/SettingsCard";
import { ExportDialog } from "./ExportDialog";
import { exportCardConfigs, type DataCardAction } from "./cards/config";

type Props = {
  slug: string;
};

export default function DataExportSection({ slug }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const context = React.useMemo(
    () => ({ allowProviderImports: false }),
    []
  );

  const onCardAction = React.useCallback((action: DataCardAction) => {
    if (action === "openExportDialog") {
      setDialogOpen(true);
    }
  }, []);

  return (
    <>
      {exportCardConfigs.map((card) => {
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
      <ExportDialog
        slug={slug}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
