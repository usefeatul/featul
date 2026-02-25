"use client";

import { NotraSwitchRow } from "@/components/changelog/notra/NotraSwitchRow";

type NotraImportOptionsSectionProps = {
  isUsingStoredConnection: boolean;
  saveConnectionDescription: string;
  saveConnection: boolean;
  onSaveConnectionChange: (checked: boolean) => void;
  isSaveConnectionDisabled: boolean;
  includeDrafts: boolean;
  onIncludeDraftsChange: (checked: boolean) => void;
  updateExisting: boolean;
  onUpdateExistingChange: (checked: boolean) => void;
  preservePublishStatus: boolean;
  onPreservePublishStatusChange: (checked: boolean) => void;
  isPending: boolean;
};

export function NotraImportOptionsSection({
  isUsingStoredConnection,
  saveConnectionDescription,
  saveConnection,
  onSaveConnectionChange,
  isSaveConnectionDisabled,
  includeDrafts,
  onIncludeDraftsChange,
  updateExisting,
  onUpdateExistingChange,
  preservePublishStatus,
  onPreservePublishStatusChange,
  isPending,
}: NotraImportOptionsSectionProps) {
  return (
    <section className="overflow-hidden rounded-md border border-border/70 bg-background">
      {!isUsingStoredConnection ? (
        <NotraSwitchRow
          title="Save encrypted connection"
          description={saveConnectionDescription}
          checked={saveConnection}
          onCheckedChange={onSaveConnectionChange}
          disabled={isSaveConnectionDisabled}
        />
      ) : null}

      <NotraSwitchRow
        title="Include drafts"
        description="Import draft and published posts."
        checked={includeDrafts}
        onCheckedChange={onIncludeDraftsChange}
        disabled={isPending}
        withTopBorder={!isUsingStoredConnection}
      />

      <NotraSwitchRow
        title="Update existing imports"
        description="When off, existing imports are skipped."
        checked={updateExisting}
        onCheckedChange={onUpdateExistingChange}
        disabled={isPending}
        withTopBorder
      />

      <NotraSwitchRow
        title="Preserve published status"
        description="When off, imports stay drafts."
        checked={preservePublishStatus}
        onCheckedChange={onPreservePublishStatusChange}
        disabled={isPending}
        withTopBorder
      />
    </section>
  );
}
