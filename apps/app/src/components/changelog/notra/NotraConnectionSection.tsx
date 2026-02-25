"use client";

import { Switch } from "@featul/ui/components/switch";
import { LoaderIcon } from "@featul/ui/icons/loader";

type NotraConnectionSectionProps = {
  hasStoredConnection: boolean;
  isUsingStoredConnection: boolean;
  isSwitchDisabled: boolean;
  isLoadingConnection: boolean;
  organizationId: string;
  connectionNotice: string | null;
  showConnectionNotice: boolean;
  onUseStoredConnectionChange: (checked: boolean) => void;
};

export function NotraConnectionSection({
  hasStoredConnection,
  isUsingStoredConnection,
  isSwitchDisabled,
  isLoadingConnection,
  organizationId,
  connectionNotice,
  showConnectionNotice,
  onUseStoredConnectionChange,
}: NotraConnectionSectionProps) {
  return (
    <section className="space-y-2">
      <div className="overflow-hidden rounded-md border border-border/70 bg-background">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5">
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground">
              Use saved connection
            </p>
            <p className="text-xs text-accent">
              {hasStoredConnection
                ? "Use saved workspace credentials."
                : "No saved workspace credentials yet."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex size-4 items-center justify-center">
              {isLoadingConnection ? (
                <LoaderIcon className="size-3.5 animate-spin text-muted-foreground" />
              ) : null}
            </span>
            <Switch
              checked={isUsingStoredConnection}
              onCheckedChange={onUseStoredConnectionChange}
              disabled={isSwitchDisabled}
            />
          </div>
        </div>

        <div className="border-t border-border/60 px-3 py-3">
          <p className="text-xs text-accent">
            {hasStoredConnection ? (
              <>
                Saved org:{" "}
                <span className="font-mono text-foreground">
                  {organizationId || "Unknown"}
                </span>
              </>
            ) : (
              "No saved connection for this workspace."
            )}
          </p>
        </div>
      </div>
      {showConnectionNotice && connectionNotice ? (
        <p className="rounded-md border border-amber-400/40 px-2.5 py-2 text-xs text-amber-700 dark:border-amber-300/30 dark:text-amber-300">
          {connectionNotice}
        </p>
      ) : null}
    </section>
  );
}
