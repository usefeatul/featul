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
  const [origins, setOrigins] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;
    let canceled = false;
    client.workspace.widgetSettings
      .$get({ slug })
      .then((res) => res.json())
      .then((data) => {
        if (!canceled && data && typeof data === "object" && "secret" in data) {
          const value = (data as { secret?: unknown }).secret;
          if (typeof value === "string") setSecret(value);
          const allowed = (data as { origins?: unknown }).origins;
          if (Array.isArray(allowed)) {
            setOrigins(
              allowed
                .filter((item): item is string => typeof item === "string")
                .join("\n"),
            );
          }
        }
      })
      .catch(() => {});
    return () => {
      canceled = true;
    };
  }, [slug]);

  const snippet = React.useMemo(() => {
    const appUrl =
      typeof window === "undefined"
        ? "https://app.featul.com"
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
  // After login, pass a short-lived, server-signed identity:
  // featul.identify({ id, email, name, avatar, expiresAt, signature });
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

  const handleSaveOrigins = async () => {
    if (!slug) return;
    setSaving(true);
    try {
      const values = origins
        .split(/\s+/)
        .map((value) => value.trim())
        .filter(Boolean);
      const response = await client.workspace.updateWidget.$post({
        slug,
        origins: values,
      });
      const data = await response.json();
      const saved =
        data && typeof data === "object" && "origins" in data
          ? data.origins
          : null;
      if (Array.isArray(saved)) {
        setOrigins(
          saved
            .filter((item): item is string => typeof item === "string")
            .join("\n"),
        );
      }
      toast.success("Widget origins saved");
    } catch {
      toast.error("Could not save widget origins");
    } finally {
      setSaving(false);
    }
  };

  const handleRotateSecret = async () => {
    if (
      !slug ||
      !window.confirm(
        "Rotate the widget secret? Existing signed identities will stop working.",
      )
    ) {
      return;
    }
    try {
      const response = await client.workspace.rotateWidget.$post({
        slug,
        confirmation: "rotate",
      });
      const data = await response.json();
      if (
        data &&
        typeof data === "object" &&
        "secret" in data &&
        typeof data.secret === "string"
      ) {
        setSecret(data.secret);
      }
      toast.success("Widget secret rotated");
    } catch {
      toast.error("Could not rotate widget secret");
    }
  };

  return (
    <SettingsCard
      icon={<Clipboard className="size-5 text-primary" />}
      title="Embed widget"
      description={
        <div className="space-y-3">
          <p className="break-words">
            Use your{" "}
            <span className="font-semibold text-foreground">Workspace ID</span>{" "}
            to embed Featul in your product. Issuers can submit and browse
            requests without leaving your app.
          </p>
          <p className="break-all text-sm text-muted-foreground">
            Workspace ID:{" "}
            <span className="font-semibold text-foreground">
              {workspaceId || "N/A"}
            </span>
          </p>
          {secret ? (
            <p className="break-all text-sm text-muted-foreground">
              Widget secret:{" "}
              <span className="font-semibold text-foreground">
                ••••••••••••{secret.slice(-4)}
              </span>
            </p>
          ) : null}
          <div className="space-y-2">
            <label
              className="text-sm font-medium text-foreground"
              htmlFor="widget-origins"
            >
              Allowed embed origins
            </label>
            <textarea
              id="widget-origins"
              value={origins}
              onChange={(event) => setOrigins(event.target.value)}
              placeholder={"https://app.example.com\nhttp://localhost:3000"}
              className="min-h-20 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
            />
            <p className="text-xs text-muted-foreground">
              Enter one HTTPS origin per line. Localhost HTTP origins are
              allowed for development.
            </p>
          </div>
          <pre className="max-h-40 overflow-auto rounded-md border border-border bg-muted/40 p-3 text-xs leading-relaxed text-foreground">
            <code>{snippet}</code>
          </pre>
          <p className="text-xs text-muted-foreground">
            Sign the complete identity payload on your server with a five-minute
            expiration so votes and posts are attributed. Call{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              featul.identify(null)
            </code>{" "}
            on logout. Listen with{" "}
            <code className="rounded bg-muted px-1 py-0.5">
              featul.on(&quot;open&quot;, fn)
            </code>
            .
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
      <Button variant="card" onClick={handleRotateSecret} disabled={!secret}>
        Rotate secret
      </Button>
      <Button
        variant="card"
        onClick={handleSaveOrigins}
        disabled={!slug || saving}
      >
        {saving ? "Saving…" : "Save origins"}
      </Button>
      <Button onClick={handleCopySnippet} disabled={!workspaceId}>
        Copy snippet
      </Button>
    </SettingsCard>
  );
}
