"use client";

import React from "react";
import { Label } from "@featul/ui/components/label";
import { LoadingButton } from "@/components/global/LoadingButton";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import DomainIcon from "@featul/ui/icons/domain";
import { isDomainValid, suggestDomainFix } from "@/lib/validators";
import { hostFromDomain } from "@/utils/domain";
import DomainHostField from "./DomainHostField";

export default function AddDomainDialog({
  open,
  onOpenChange,
  onSave,
  saving,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSave: (baseDomain: string) => void;
  saving?: boolean;
}) {
  const [value, setValue] = React.useState("");

  React.useEffect(() => {
    if (!open) setValue("");
  }, [open]);

  const host = hostFromDomain(value);
  const domainValid = !host || isDomainValid(host);
  const suggestedDomain = suggestDomainFix(host);
  const canSave = Boolean(host) && domainValid && !saving;

  const handleSave = () => {
    if (!canSave) return;
    onSave(host);
  };

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={onOpenChange}
      title="Add domain"
      description="This will be the primary domain for your workspace."
      icon={<DomainIcon className="size-3.5" />}
    >
      <div className="space-y-2">
        <Label htmlFor="domain">Domain</Label>
        <DomainHostField
          id="domain"
          value={value}
          onChange={setValue}
          invalid={!domainValid}
          autoFocus
          onSubmit={handleSave}
        />
        {!domainValid && host ? (
          <div className="flex items-center gap-1 text-xs text-destructive">
            <span>Invalid domain</span>
            {suggestedDomain ? (
              <>
                <span>— did you mean</span>
                <button
                  type="button"
                  className="cursor-pointer font-heading text-destructive underline underline-offset-2 transition-opacity hover:opacity-80"
                  onClick={() => setValue(suggestedDomain)}
                >
                  {suggestedDomain}
                </button>
                ?
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      <div className="flex justify-end gap-2 pt-3">
        <LoadingButton variant="card" onClick={() => onOpenChange(false)}>
          Cancel
        </LoadingButton>
        <LoadingButton
          loading={Boolean(saving)}
          onClick={handleSave}
          disabled={!canSave}
        >
          Save
        </LoadingButton>
      </div>
    </SettingsDialogShell>
  );
}
