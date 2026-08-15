"use client";

import React from "react";
import SectionCard from "../global/SectionCard";
import TimezoneCard from "./cards/TimezoneCard";
import WidgetCard from "./cards/Widget";
import DangerZoneCard from "./cards/DangerZoneCard";

type Props = {
    slug: string;
    workspaceId?: string;
    workspaceName?: string;
    timezone?: string;
};

export default function WorkspaceSection({ slug, workspaceId, workspaceName, timezone }: Props) {
    return (
        <SectionCard title="Workspace" description="Manage your workspace settings.">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TimezoneCard slug={slug} initialTimezone={timezone} />
                <WidgetCard workspaceId={workspaceId} slug={slug} />
                <DangerZoneCard slug={slug} workspaceName={workspaceName} />
            </div>
        </SectionCard>
    );
}
