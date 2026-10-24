"use client";

import React from "react";
import { useSession } from "@featul/auth/client";
import TimezoneCard from "./cards/TimezoneCard";
import EmbedCard from "./cards/Embed";
import SigningSecretCard from "./cards/SigningSecretCard";
import DangerZoneCard from "./cards/DangerZoneCard";
import { WidgetSection } from "./cards/widget";

type Props = {
  slug: string;
  workspaceId?: string;
  workspaceName?: string;
  workspaceOwnerId?: string;
  timezone?: string;
};

export default function WorkspaceSection({
  slug,
  workspaceId,
  workspaceName,
  workspaceOwnerId,
  timezone,
}: Props) {
  const { data: session } = useSession();
  // Only the owner can delete a workspace, so hide the danger zone from everyone else.
  const isOwner = Boolean(
    workspaceOwnerId &&
      session?.user?.id &&
      workspaceOwnerId === session.user.id,
  );
  return (
    <div className="flex flex-col gap-8">
      <TimezoneCard slug={slug} initialTimezone={timezone} />
      <WidgetSection>
        <EmbedCard workspaceId={workspaceId} />
        <SigningSecretCard slug={slug} />
      </WidgetSection>
      {isOwner ? (
        <DangerZoneCard slug={slug} workspaceName={workspaceName} />
      ) : null}
    </div>
  );
}
