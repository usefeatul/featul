"use client";

import React from "react";
import SettingsCard from "../../../global/SettingsCard";
import { ClipboardIcon as Clipboard } from "@featul/ui/icons/clipboard";
import { Button } from "@featul/ui/components/button";
import { toast } from "sonner";
import { client } from "@featul/api/client";

type Props = {
  workspaceId?: string;
  slug?: string;
};

export default function WidgetCard({ workspaceId, slug }: Props) {
  const [secret, setSecret] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!slug) return;
    let canceled = false;
    client.workspace.widgetSecret
      .$get({ slug })
      .then((res) => res.json())
      .then((data) => {
        if (!canceled && data && typeof data === "object" && "secret" in data) {
          const value = (data as { secret?: unknown }).secret;
          if (typeof value === "string") setSecret(value);
        }
      })
      .catch(() => {});
    return () => {
      canceled = true;
    };
  }, [slug]);

  const snippet = React.useMemo(() => {
    const appUrl =
      typeof window === "undefined" ? "https://app.featul.com" : window.location.origin;
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
  // After login, pass HMAC-SHA256(widgetSecret, id + ":" + email):
  // featul.identify({ id, email, name, signature });
  // On logout: featul.identify(null);
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

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    toast.success("Widget secret copied");
  };

  return (
    <SettingsCard
      icon={<Clipboard className="size-5 text-primary" />}
      title="Embed widget"
      description={
        <div className="space-y-3">
          <p className="break-words">
            Use your <span className="font-semibold text-foreground">Workspace ID</span> to embed
            Featul in your product. Issuers can submit and browse requests without leaving your app.
          </p>
          <p className="break-all text-sm text-muted-foreground">
            Workspace ID:{" "}
            <span className="font-semibold text-foreground">{workspaceId || "N/A"}</span>
          </p>
          {secret ? (
            <p className="break-all text-sm text-muted-foreground">
              Widget secret:{" "}
              <span className="font-semibold text-foreground">{secret}</span>
            </p>
          ) : null}
          <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
            <code>{snippet}</code>
          </pre>
          <p className="text-xs text-muted-foreground">
            Sign identify payloads with HMAC-SHA256(secret, <code>id:email</code>) so votes and
            posts are attributed. Call{" "}
            <code className="rounded bg-muted px-1 py-0.5">featul.identify(null)</code> on logout.
            Listen with{" "}
            <code className="rounded bg-muted px-1 py-0.5">featul.on(&quot;open&quot;, fn)</code>.
          </p>
        </div>
      }
      disabled={!workspaceId}
    >
      <Button variant="card" onClick={handleCopyId} disabled={!workspaceId}>
        Copy ID
      </Button>
      <Button variant="card" onClick={handleCopySecret} disabled={!secret}>
        Copy secret
      </Button>
      <Button onClick={handleCopySnippet} disabled={!workspaceId}>
        Copy snippet
      </Button>
    </SettingsCard>
  );
}
