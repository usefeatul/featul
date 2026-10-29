"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { client } from "@featul/api/client";
import { Input } from "@featul/ui/components/input";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@featul/ui/components/table";
import { KeyIcon, MoreVertical } from "@/components/global/icons";
import { LoadingButton } from "@/components/global/LoadingButton";
import { DestructiveConfirmDialog } from "@/components/global/DestructiveConfirmDialog";
import CopyValueButton from "@/components/settings/domain/CopyValueButton";
import { relativeTime } from "@/lib/time";
import SectionCard from "../global/SectionCard";
import { SettingsDialogShell } from "../global/SettingsDialogShell";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  lastUsedAt: Date | string | null;
  createdAt: Date | string;
  createdByName: string | null;
};

const DOCS_URL = "https://featul.com/docs/developers/api";
const MCP_DOCS_URL = "https://featul.com/docs/developers/mcp";
const MCP_URL = "https://api.featul.com/mcp";

function claudeCodeCommand(key: string) {
  return `claude mcp add --transport http featul ${MCP_URL} --header "Authorization: Bearer ${key}"`;
}

async function errorMessage(res: { json: () => Promise<unknown> }, fallback: string) {
  const body = (await res.json().catch(() => null)) as { message?: string } | null;
  return body?.message || fallback;
}

function CreateKeyDialog({
  open,
  onOpenChange,
  slug,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  slug: string;
  onCreated: () => void;
}) {
  const [name, setName] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [createdKey, setCreatedKey] = React.useState<string | null>(null);

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setName("");
      setCreatedKey(null);
    }
    onOpenChange(next);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const res = await client.apiKey.create.$post({ slug, name: name.trim() });
      if (!res.ok) throw new Error(await errorMessage(res, "Failed to create API key"));
      const data = (await res.json()) as { key: string };
      setCreatedKey(data.key);
      onCreated();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create API key");
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title={createdKey ? "Copy your API key" : "Create API key"}
      icon={<KeyIcon className="size-4" />}
      width="default"
      dismissOnOutside={!createdKey}
    >
      {createdKey ? (
        <div className="space-y-3">
          <p className="text-sm text-accent">
            Store it as a secret in your CI, for example <code>FEATUL_API_KEY</code>. You
            won&apos;t be able to see it again.
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
            <code className="min-w-0 flex-1 truncate text-xs text-foreground">{createdKey}</code>
            <CopyValueButton value={createdKey} label="API key" />
          </div>
          <p className="text-sm text-accent">
            To let Claude Code triage feedback and draft changelog entries, run this. For Cursor and
            other assistants,{" "}
            <a href={MCP_DOCS_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              see the MCP setup
            </a>
            .
          </p>
          <div className="flex items-center gap-2 rounded-lg border border-border/60 px-3 py-2">
            <code className="min-w-0 flex-1 truncate text-xs text-foreground">
              {claudeCodeCommand(createdKey)}
            </code>
            <CopyValueButton value={claudeCodeCommand(createdKey)} label="Command" />
          </div>
          <div className="flex justify-end">
            <LoadingButton type="button" onClick={() => handleOpenChange(false)}>
              Done
            </LoadingButton>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <p className="text-sm text-accent">
            Give the key a name so you know where it&apos;s used, like &quot;GitHub Actions&quot;.
          </p>
          <Input
            autoFocus
            value={name}
            maxLength={64}
            placeholder="GitHub Actions"
            onChange={(event) => setName(event.target.value)}
          />
          <div className="flex justify-end gap-2">
            <LoadingButton
              type="button"
              variant="card"
              disabled={saving}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </LoadingButton>
            <LoadingButton type="submit" loading={saving} disabled={!name.trim()}>
              Create key
            </LoadingButton>
          </div>
        </form>
      )}
    </SettingsDialogShell>
  );
}

/** Workspace API keys for the REST API and MCP server, e.g. publishing changelog entries from CI. */
export default function ApiKeys({ slug, allowed }: { slug: string; allowed: boolean }) {
  const queryKey = ["api-keys", slug];
  const { data: keys = [], isLoading, refetch } = useQuery<ApiKey[]>({
    queryKey,
    queryFn: async () => {
      const res = await client.apiKey.list.$get({ slug });
      if (!res.ok) return [];
      const data = (await res.json()) as { keys?: ApiKey[] };
      return Array.isArray(data.keys) ? data.keys : [];
    },
    staleTime: 30_000,
  });

  const [createOpen, setCreateOpen] = React.useState(false);
  const [actionOpenId, setActionOpenId] = React.useState<string | null>(null);
  const [revoking, setRevoking] = React.useState<ApiKey | null>(null);
  const [isRevoking, setIsRevoking] = React.useState(false);

  const handleRevoke = async () => {
    if (!revoking) return;
    setIsRevoking(true);
    try {
      const res = await client.apiKey.revoke.$post({ slug, keyId: revoking.id });
      if (!res.ok) throw new Error(await errorMessage(res, "Failed to revoke API key"));
      toast.success("API key revoked");
      setRevoking(null);
      await refetch();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to revoke API key");
    } finally {
      setIsRevoking(false);
    }
  };

  return (
    <SectionCard
      title="API keys"
      description={
        <>
          Publish changelog entries from CI/CD, or connect Claude and Cursor to triage feedback.{" "}
          <a href={DOCS_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            API docs
          </a>
          {" · "}
          <a href={MCP_DOCS_URL} target="_blank" rel="noreferrer" className="text-primary hover:underline">
            MCP setup
          </a>
          .
        </>
      }
      action={
        <LoadingButton type="button" disabled={!allowed} onClick={() => setCreateOpen(true)}>
          Create key
        </LoadingButton>
      }
    >
      <Table variant="settings" containerClassName="-mx-5 w-[calc(100%+2.5rem)]">
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Name</TableHead>
            <TableHead className="px-4">Key</TableHead>
            <TableHead className="px-4">Last used</TableHead>
            <TableHead className="w-14 px-2 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {keys.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={4} className="px-4 py-8 text-accent">
                No API keys
              </TableCell>
            </TableRow>
          ) : (
            keys.map((key) => (
              <TableRow key={key.id}>
                <TableCell className="px-4">
                  <span className="block truncate font-medium">{key.name}</span>
                  {key.createdByName ? (
                    <span className="block truncate text-xs text-accent">
                      Created by {key.createdByName}
                    </span>
                  ) : null}
                </TableCell>
                <TableCell className="px-4">
                  <code className="text-xs text-accent">{key.prefix}…</code>
                </TableCell>
                <TableCell className="px-4 text-accent">
                  {key.lastUsedAt ? relativeTime(new Date(key.lastUsedAt).toISOString()) : "Never"}
                </TableCell>
                <TableCell className="px-2 text-right">
                  <Popover
                    open={actionOpenId === key.id}
                    onOpenChange={(open) => setActionOpenId(open ? key.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <LoadingButton
                        type="button"
                        variant="nav"
                        size="icon-sm"
                        aria-label={`Actions for ${key.name}`}
                        className="ml-auto"
                      >
                        <MoreVertical className="size-4 opacity-70" />
                      </LoadingButton>
                    </PopoverTrigger>
                    <PopoverContent list className="min-w-0 w-fit">
                      <PopoverList>
                        <PopoverListItem
                          role="menuitem"
                          onClick={() => {
                            setActionOpenId(null);
                            setRevoking(key);
                          }}
                        >
                          <span className="text-sm text-red-500">Revoke</span>
                        </PopoverListItem>
                      </PopoverList>
                    </PopoverContent>
                  </Popover>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <CreateKeyDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        slug={slug}
        onCreated={() => void refetch()}
      />
      <DestructiveConfirmDialog
        open={Boolean(revoking)}
        onOpenChange={(open) => {
          if (!open) setRevoking(null);
        }}
        isPending={isRevoking}
        onConfirm={() => void handleRevoke()}
        title="Revoke API key?"
        description={`Anything using "${revoking?.name ?? ""}" will stop working immediately.`}
        confirmLabel="Revoke"
        pendingLabel="Revoking..."
      />
    </SectionCard>
  );
}
