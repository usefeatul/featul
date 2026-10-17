"use client";

import React from "react";
import TimezoneCard from "./cards/TimezoneCard";
import EmbedCard from "./cards/Embed";
import SigningSecretCard from "./cards/SigningSecretCard";
import DangerZoneCard from "./cards/DangerZoneCard";
import { WidgetSection } from "./cards/widget";

type Props = {
  slug: string;
  workspaceId?: string;
  workspaceName?: string;
  timezone?: string;
};

export default function WorkspaceSection({
  slug,
  workspaceId,
  workspaceName,
  timezone,
}: Props) {
  return (
    <div className="flex flex-col gap-8">
      <TimezoneCard slug={slug} initialTimezone={timezone} />
      <WidgetSection>
        <EmbedCard workspaceId={workspaceId} />
        <SigningSecretCard slug={slug} />
      </WidgetSection>
      <DangerZoneCard slug={slug} workspaceName={workspaceName} />
    </div>
  );
}
