"use client";

import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { ClipboardIcon as Clipboard } from "@featul/ui/icons/clipboard";
import { Button } from "@featul/ui/components/button";
import { toast } from "sonner";

type Props = {
  workspaceId?: string;
};

export default function EmbedCard({ workspaceId }: Props) {
  const snippet = React.useMemo(() => {
    const envUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");
    const appUrl =
      typeof window === "undefined"
        ? envUrl || "https://app.featul.com"
        : window.location.origin;
    return `<script>
  window.$featulq = window.$featulq || [];
  window.featul = window.featul || new Proxy({}, {
    get: (_, method) => (...args) => window.$featulq.push([method, ...args])
  });
</script>
<script async src="${appUrl}/widget/sdk/v1.js"></script>
<script>
  featul.init("${workspaceId || "YOUR_WORKSPACE_ID"}", {
    widget: true,
    theme: "auto",
    position: "right"
  });
</script>`;
  }, [workspaceId]);

  const handleCopyId = () => {
    if (!workspaceId) return;
    navigator.clipboard.writeText(workspaceId);
    toast.success("Workspace ID copied");
  };

  const handleCopySnippet = () => {
    if (!workspaceId) return;
    navigator.clipboard.writeText(snippet);
    toast.success("Widget snippet copied");
  };

  return (
    <div className="h-full">
      <SettingsCard
        icon={<Clipboard className="size-5 text-primary" />}
        title="Embed widget"
        description={
          <div className="space-y-3">
            <p className="break-words">
              Paste this snippet into your app to load the widget. It uses
              the same branding and public Roadmap / Changelog settings as
              your workspace site.
            </p>
            <p className="break-all text-sm text-muted-foreground">
              Workspace ID:{" "}
              <span className="font-semibold text-foreground">
                {workspaceId || "N/A"}
              </span>
            </p>
          </div>
        }
        disabled={!workspaceId}
      >
        <Button variant="card" onClick={handleCopyId} disabled={!workspaceId}>
          Copy ID
        </Button>
        <Button onClick={handleCopySnippet} disabled={!workspaceId}>
          Copy snippet
        </Button>
      </SettingsCard>
    </div>
  );
}
