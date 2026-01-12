"use client";

import React, { useState } from "react";
import SettingsCard from "../../../global/SettingsCard";
import { Globe2 } from "lucide-react";
import TimezonePicker from "../../../wizard/TimezonePicker";
import { SettingsDialogShell } from "../../global/SettingsDialogShell";
import { useWorkspaceTimezone } from "@/hooks/useWorkspaceTimezone";

type Props = {
    slug: string;
    initialTimezone?: string;
};

export default function TimezoneCard({ slug, initialTimezone }: Props) {
    const [now] = useState(new Date());
    const [dialogOpen, setDialogOpen] = useState(false);
    const { timezone, updateTimezone } = useWorkspaceTimezone(slug, initialTimezone);

    const friendlyTZ = (tz: string) => {
        const city = tz.split("/").slice(-1)[0]?.replace(/_/g, " ") ?? tz;
        return city;
    };

    const handleTimezoneChange = (newTimezone: string) => {
        updateTimezone(newTimezone);
        setDialogOpen(false);
    };

    return (
        <>
            <SettingsCard
                icon={<Globe2 className="size-5 text-primary" />}
                title="Timezone"
                description={<span>Current timezone: <span className="font-medium text-black">{friendlyTZ(timezone)}</span>. All workspace graphs, ranges and timestamps will be matched to this timezone.</span>}
                buttonLabel="Change"
                onAction={() => setDialogOpen(true)}
            />

            <SettingsDialogShell
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="Change Timezone"
                icon={<Globe2 className="w-4 h-4" />}
                width="default"
            >
                <TimezonePicker value={timezone} onChange={handleTimezoneChange} now={now} />
            </SettingsDialogShell>
        </>
    );
}
