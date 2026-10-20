"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import SettingsEntry from "../global/entry";
import { ExportDialog } from "./ExportDialog";
import { exportCardConfigs, type DataCardAction } from "./cards/config";

type Props = {
  slug: string;
};

export default function DataExportSection({ slug }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const context = React.useMemo(() => ({ allowProviderImports: false }), []);

  const onCardAction = React.useCallback((action: DataCardAction) => {
    if (action === "openExportDialog") {
      setDialogOpen(true);
    }
  }, []);

  return (
    <>
      <SectionCard title="Export data" contentClassName="py-0">
        <div className="-mx-5 divide-y divide-border/50 [&>*]:px-5">
          {exportCardConfigs.map((card) => {
            const Icon = card.icon;
            return (
              <SettingsEntry
                key={card.id}
                icon={<Icon className={card.iconClassName} />}
                title={card.title}
                description={card.description(context)}
                onAction={() => onCardAction(card.action)}
                disabled={Boolean(card.disabled)}
              />
            );
          })}
        </div>
      </SectionCard>
      <ExportDialog
        slug={slug}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
