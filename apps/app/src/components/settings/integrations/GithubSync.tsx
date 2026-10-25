"use client";

import React from "react";
import Link from "next/link";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@featul/ui/components/select";
import { Switch } from "@featul/ui/components/switch";
import { GitHubIcon, MoreVertical } from "@/components/global/icons";
import StatusIcon from "@/components/requests/StatusIcon";
import { LoadingButton } from "@/components/global/LoadingButton";
import { useGithubSetupToast } from "@/components/help/GithubRepoField";
import SectionCard from "../global/SectionCard";

type Settings = {
  autoStatus: boolean;
  openStatus: "review" | "planned";
  progressLabels: string[];
};

type GithubSettings = {
  configured: boolean;
  connected: boolean;
  accountLogin: string | null;
  settings: Settings;
};

type IssueLink = {
  id: string;
  repoFullName: string;
  issueNumber: number;
  url: string;
  state: "open" | "closed";
  stateReason: string | null;
  postTitle: string;
  postSlug: string;
  roadmapStatus: string | null;
};

const DOCS_URL = "https://featul.com/docs/developers/github-issues";

function stateDotClass(link: Pick<IssueLink, "state" | "stateReason">) {
  if (link.state === "open") return "bg-emerald-500";
  return link.stateReason === "not_planned" || link.stateReason === "duplicate"
    ? "bg-zinc-400"
    : "bg-violet-500";
}

/** Requests linked from GitHub issue descriptions, with a way to unlink them. */
type LinksPage = {
  links: IssueLink[];
  total: number;
  nextOffset: number | null;
};
type SyncSummary = {
  repos: number;
  issues: number;
  linked: number;
  updated: number;
  unlinked: number;
  truncated: string[];
  failed: string[];
};

function syncMessage(summary: SyncSummary) {
  const changes = [
    summary.linked && `${summary.linked} linked`,
    summary.updated &&
      `${summary.updated} status${summary.updated === 1 ? "" : "es"} updated`,
    summary.unlinked && `${summary.unlinked} unlinked`,
  ].filter(Boolean);
  const read = `Read ${summary.issues.toLocaleString()} issue${summary.issues === 1 ? "" : "s"}`;
  return changes.length
    ? `${read}: ${changes.join(", ")}`
    : `${read}. Everything was up to date.`;
}

function LinkedIssues({ slug, allowed }: { slug: string; allowed: boolean }) {
  const {
    data,
    isLoading,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<LinksPage>({
    queryKey: ["github-links", slug],
    initialPageParam: 0,
    queryFn: async ({ pageParam }) => {
      const res = await client.github.links.$get({
        slug,
        offset: Number(pageParam),
      });
      if (!res.ok) return { links: [], total: 0, nextOffset: null };
      return (await res.json()) as LinksPage;
    },
    getNextPageParam: (page) => page.nextOffset ?? undefined,
    staleTime: 30_000,
  });
  const links = data?.pages.flatMap((page) => page.links) ?? [];
  const total = data?.pages[0]?.total ?? 0;
  const [menuId, setMenuId] = React.useState<string | null>(null);
  const [syncing, setSyncing] = React.useState(false);

  const sync = async () => {
    setSyncing(true);
    try {
      const res = await client.github.sync.$post({ slug });
      if (!res.ok)
        throw new Error(await readError(res, "Couldn't sync with GitHub"));
      const summary = (await res.json()) as SyncSummary;
      toast.success(syncMessage(summary));
      if (summary.truncated.length > 0) {
        toast.info(
          `Only the newest issues were read in ${summary.truncated.join(", ")}.`,
        );
      }
      if (summary.failed.length > 0) {
        toast.error(
          `Couldn't read issues in ${summary.failed.join(", ")}. Check that the Featul GitHub App still has access, then reconnect GitHub.`,
        );
      }
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't sync with GitHub",
      );
    } finally {
      setSyncing(false);
    }
  };

  const unlink = async (link: IssueLink) => {
    setMenuId(null);
    const res = await client.github.unlink.$post({ slug, linkId: link.id });
    if (!res.ok) {
      toast.error(await readError(res, "Couldn't unlink the issue"));
      return;
    }
    toast.success("Unlinked");
    await refetch();
  };

  return (
    <SectionCard
      title={
        total > 0
          ? `Linked issues · ${total.toLocaleString()}`
          : "Linked issues"
      }
      description="Paste a request's link into a GitHub issue description to link them. The request then follows the issue's status."
      action={
        <LoadingButton
          type="button"
          variant="card"
          loading={syncing}
          disabled={syncing || !allowed}
          onClick={sync}
        >
          Sync
        </LoadingButton>
      }
    >
      <Table
        variant="settings"
        containerClassName="-mx-5 w-[calc(100%+2.5rem)]"
      >
        <TableHeader>
          <TableRow>
            <TableHead className="px-4">Request</TableHead>
            <TableHead className="w-52 px-4">Issue</TableHead>
            <TableHead className="w-14 px-2 text-right" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {links.length === 0 && !isLoading ? (
            <TableRow>
              <TableCell colSpan={3} className="px-4 py-8 text-accent">
                No linked issues
              </TableCell>
            </TableRow>
          ) : (
            links.map((link) => (
              <TableRow key={link.id}>
                <TableCell className="max-w-0 px-4">
                  <Link
                    href={`/workspaces/${slug}/requests/${link.postSlug}`}
                    className="flex min-w-0 items-center gap-2 hover:underline"
                  >
                    <StatusIcon
                      status={link.roadmapStatus || "pending"}
                      className="size-4 shrink-0"
                    />
                    <span className="truncate font-medium">
                      {link.postTitle}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className="px-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 whitespace-nowrap text-accent hover:underline"
                  >
                    <span
                      aria-hidden
                      className={`size-2 shrink-0 rounded-full ${stateDotClass(link)}`}
                    />
                    {link.repoFullName.split("/")[1]}#{link.issueNumber}
                  </a>
                </TableCell>
                <TableCell className="px-2 text-right">
                  <Popover
                    open={menuId === link.id}
                    onOpenChange={(open) => setMenuId(open ? link.id : null)}
                  >
                    <PopoverTrigger asChild>
                      <LoadingButton
                        type="button"
                        variant="nav"
                        size="icon-sm"
                        aria-label={`Actions for ${link.postTitle}`}
                        className="ml-auto"
                      >
                        <MoreVertical className="size-4 opacity-70" />
                      </LoadingButton>
                    </PopoverTrigger>
                    <PopoverContent list className="min-w-0 w-fit">
                      <PopoverList>
                        <PopoverListItem
                          role="menuitem"
                          onClick={() => void unlink(link)}
                        >
                          <span className="text-sm text-red-500">Unlink</span>
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
      {hasNextPage ? (
        <div className="flex justify-center pt-3">
          <LoadingButton
            type="button"
            variant="card"
            loading={isFetchingNextPage}
            disabled={isFetchingNextPage}
            onClick={() => void fetchNextPage()}
          >
            Load more
          </LoadingButton>
        </div>
      ) : null}
    </SectionCard>
  );
}

async function readError(
  res: { json: () => Promise<unknown> },
  fallback: string,
) {
  const body = (await res.json().catch(() => null)) as {
    message?: string;
  } | null;
  return body?.message || fallback;
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-accent">{description}</p>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

/** Connects GitHub and sets how linked issues move requests along the roadmap. */
export default function GithubSync({
  slug,
  allowed,
}: {
  slug: string;
  allowed: boolean;
}) {
  useGithubSetupToast();
  const { data, refetch } = useQuery<GithubSettings | null>({
    queryKey: ["github-sync-settings", slug],
    queryFn: async () => {
      const res = await client.github.settings.$get({ slug });
      if (!res.ok) return null;
      return (await res.json()) as GithubSettings;
    },
    staleTime: 30_000,
  });

  const [draft, setDraft] = React.useState<Settings | null>(null);
  const [labelsText, setLabelsText] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<
    null | "connect" | "save" | "disconnect"
  >(null);
  const settings = draft ?? data?.settings ?? null;
  const labels = labelsText ?? settings?.progressLabels.join(", ") ?? "";
  const dirty = draft !== null || labelsText !== null;

  const connect = async () => {
    setBusy("connect");
    try {
      const back = new URL(window.location.href);
      back.searchParams.delete("github");
      const res = await client.help.githubConnectUrl.$post({
        slug,
        returnTo: `${back.pathname}${back.search}`,
      });
      if (!res.ok)
        throw new Error(
          await readError(res, "Couldn't start the GitHub connection"),
        );
      const { url } = (await res.json()) as { url: string };
      window.location.href = url;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't start the GitHub connection",
      );
      setBusy(null);
    }
  };

  const save = async () => {
    if (!settings) return;
    setBusy("save");
    try {
      const progressLabels = labels
        .split(",")
        .map((label) => label.trim())
        .filter(Boolean);
      const res = await client.github.settingsUpdate.$post({
        slug,
        ...settings,
        progressLabels,
      });
      if (!res.ok)
        throw new Error(await readError(res, "Couldn't save GitHub settings"));
      toast.success("GitHub settings saved");
      setDraft(null);
      setLabelsText(null);
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Couldn't save GitHub settings",
      );
    } finally {
      setBusy(null);
    }
  };

  const disconnect = async () => {
    setBusy("disconnect");
    try {
      const res = await client.help.githubDisconnect.$post({ slug });
      if (!res.ok)
        throw new Error(await readError(res, "Couldn't disconnect GitHub"));
      toast.success("GitHub disconnected");
      await refetch();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Couldn't disconnect GitHub",
      );
    } finally {
      setBusy(null);
    }
  };

  const update = (patch: Partial<Settings>) =>
    settings && setDraft({ ...settings, ...patch });
  const connected = Boolean(data?.connected);

  return (
    <>
      <SectionCard
        title="GitHub"
        icon={<GitHubIcon className="size-4" />}
        status={
          connected
            ? {
                tone: "success",
                label: "Connected",
                message: `Connected to GitHub as ${data?.accountLogin ?? "your account"}. Help Center imports use the same connection.`,
              }
            : data && !data.configured
              ? {
                  tone: "neutral",
                  label: "Unavailable",
                  message: "GitHub isn't set up on this server yet.",
                }
              : undefined
        }
        action={
          connected ? (
            <LoadingButton
              type="button"
              variant="card"
              loading={busy === "disconnect"}
              disabled={busy !== null}
              onClick={disconnect}
            >
              Disconnect
            </LoadingButton>
          ) : (
            <LoadingButton
              type="button"
              variant="card"
              loading={busy === "connect"}
              disabled={!allowed || !data?.configured || busy !== null}
              onClick={connect}
            >
              Connect
            </LoadingButton>
          )
        }
        description={
          <>
            Keep requests' roadmap status in sync with the GitHub issues they're
            linked to.{" "}
            <a
              href={DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              How it works
            </a>
            .
          </>
        }
      >
        {connected && settings ? (
          <div className="divide-y divide-border/40">
            <Row
              title="Update roadmap status"
              description="Change a linked request's status when its issue is closed, reopened, or labeled."
            >
              <Switch
                checked={settings.autoStatus}
                onCheckedChange={(checked) => update({ autoStatus: checked })}
                aria-label="Update roadmap status from GitHub"
              />
            </Row>
            <Row
              title="Open issues"
              description="Status for open issues without an in-progress label."
            >
              <Select
                value={settings.openStatus}
                onValueChange={(value) =>
                  update({ openStatus: value as Settings["openStatus"] })
                }
              >
                <SelectTrigger
                  className="h-8 w-36 text-xs"
                  aria-label="Status for open issues"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned" className="text-xs">
                    Planned
                  </SelectItem>
                  <SelectItem value="review" className="text-xs">
                    Review
                  </SelectItem>
                </SelectContent>
              </Select>
            </Row>
            <Row
              title="In progress labels"
              description="Open issues with any of these labels are In progress. Separate with commas."
            >
              <Input
                value={labels}
                onChange={(event) => setLabelsText(event.target.value)}
                aria-label="In progress labels"
                className="h-8 w-48 text-xs"
              />
            </Row>
            <p className="py-3 text-xs text-accent">
              Closed as completed → Completed. Closed as not planned or
              duplicate → Closed.
            </p>
            {dirty ? (
              <div className="flex justify-end gap-2 pt-3">
                <LoadingButton
                  type="button"
                  variant="card"
                  disabled={busy !== null}
                  onClick={() => {
                    setDraft(null);
                    setLabelsText(null);
                  }}
                >
                  Cancel
                </LoadingButton>
                <LoadingButton
                  type="button"
                  loading={busy === "save"}
                  disabled={busy !== null}
                  onClick={save}
                >
                  Save
                </LoadingButton>
              </div>
            ) : null}
          </div>
        ) : null}
      </SectionCard>
      {connected ? <LinkedIssues slug={slug} allowed={allowed} /> : null}
    </>
  );
}
