"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import SettingsEntry from "../global/entry";
import { isDataImportsAllowed } from "@/lib/plan";
import { ImportDialog } from "./ImportDialog";
import { importCardConfigs, type DataCardAction } from "./cards/config";
import { ProviderImportDialog, type ImportProvider } from "./ProviderImportDialog";

const PROVIDER_ACTIONS: Partial<Record<DataCardAction, ImportProvider>> = {
  openCannyImport: "canny",
  openNoltImport: "nolt",
  openProductBoardImport: "productboard",
};

type Props = {
  slug: string;
  plan?: string;
};

export default function DataImportSection({ slug, plan }: Props) {
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [provider, setProvider] = React.useState<ImportProvider | null>(null);
  const allowProviderImports = isDataImportsAllowed(plan ?? "free");
  const context = React.useMemo(
    () => ({ allowProviderImports }),
    [allowProviderImports],
  );

  const onCardAction = React.useCallback((action: DataCardAction) => {
    if (action === "openImportDialog") {
      setDialogOpen(true);
      return;
    }
    const next = PROVIDER_ACTIONS[action];
    if (next) setProvider(next);
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
                disabled={Boolean(card.disabled?.(context))}
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
      <ProviderImportDialog
        slug={slug}
        provider={provider}
        onOpenChange={(open) => {
          if (!open) setProvider(null);
        }}
      />
    </>
  );
}
