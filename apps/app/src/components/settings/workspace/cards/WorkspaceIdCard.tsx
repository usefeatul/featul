"use client";

import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { ClipboardIcon as Clipboard } from "@featul/ui/icons/clipboard";
import { Button } from "@featul/ui/components/button";
import { toast } from "sonner";

type Props = {
    workspaceId?: string;
};

export default function WorkspaceIdCard({ workspaceId }: Props) {
    const snippet = React.useMemo(() => {
        const appUrl = typeof window === "undefined" ? "https://app.featul.com" : window.location.origin;
        return `<script async src="${appUrl}/widget/sdk.js"></script>
<script>
  window.$featulq = window.$featulq || [];
  window.featul = window.featul || new Proxy({}, {
    get: (_, method) => (...args) => window.$featulq.push([method, ...args])
  });
  window.featul.init("${workspaceId || "WORKSPACE_ID"}", {
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
        <SettingsCard
            icon={<Clipboard className="size-5 text-primary" />}
            title="Embed widget"
            description={
                <div className="space-y-3">
                    <p className="break-words">
                        Project ID: <span className="font-semibold text-foreground break-all">{workspaceId || "N/A"}</span>. Paste the widget snippet into your app to collect feedback in-product.
                    </p>
                    <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
                        <code>{snippet}</code>
                    </pre>
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
    );
}
