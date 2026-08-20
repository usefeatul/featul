"use client";

import React, { useState } from "react";
import SettingsCard from "../../../global/SettingsCard";
import { TimezoneIcon as Timezone } from "@featul/ui/icons/timezone";
import { TimezoneSelectPanel } from "../../../wizard/TimezoneSelectPanel";
import { SettingsDialogShell } from "../../global/SettingsDialogShell";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceTimezone";
import { friendlyTimezoneCity } from "@/lib/timezone";

type Props = {
  slug: string;
  initialTimezone?: string;
};

export default function TimezoneCard({ slug, initialTimezone }: Props) {
  const [now] = useState(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const { timezone, updateTimezone } = useWorkspaceTimezone(
    slug,
    initialTimezone,
  );

  const handleTimezoneChange = (newTimezone: string) => {
    if (newTimezone === timezone) {
      setDialogOpen(false);
      return;
    }
    updateTimezone(newTimezone);
    setDialogOpen(false);
  };

  return (
    <div className="h-full">
      <SettingsCard
        icon={<Timezone className="size-5 text-primary" />}
        title="Timezone"
        description={
          <span className="break-words">
            Current timezone:{" "}
            <span className="font-semibold text-foreground">
              {friendlyTimezoneCity(timezone)}
            </span>
            . All workspace graphs, ranges and timestamps will be matched to
            this timezone.
          </span>
        }
        buttonLabel="Change"
        onAction={() => setDialogOpen(true)}
      />

      <SettingsDialogShell
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        title="Change timezone"
        description="Search and pick a timezone. Timestamps update right away."
        icon={<Timezone className="size-5" />}
        width="wide"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <TimezoneSelectPanel
          autoFocus
          value={timezone}
          onChange={handleTimezoneChange}
          now={now}
          className="h-full max-h-[min(58dvh,420px)]"
        />
      </SettingsDialogShell>
    </div>
  );
}
