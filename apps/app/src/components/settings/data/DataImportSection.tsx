"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import SettingsEntry from "../global/entry";
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
    [allowProviderImports],
  );

  const onCardAction = React.useCallback((action: DataCardAction) => {
    if (action === "openImportDialog") {
      setDialogOpen(true);
    }
  }, []);

  return (
    <>
      <SectionCard title="Import feedback" contentClassName="py-0">
        <div className="-mx-5 divide-y divide-border/50 [&>*]:px-5">
          {importCardConfigs.map((card) => {
            const Icon = card.icon;
            return (
              <SettingsEntry
                key={card.id}
                icon={<Icon className={card.iconClassName} />}
                title={card.title}
                description={card.description(context)}
                onAction={() => onCardAction(card.action)}
                disabled={Boolean(card.disabled)}
              >
                <span className="rounded-md bg-muted px-2 py-1 text-xs whitespace-nowrap">
                  {card.buttonLabel(context)}
                </span>
              </SettingsEntry>
            );
          })}
        </div>
      </SectionCard>
      <ImportDialog
        slug={slug}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </>
  );
}
