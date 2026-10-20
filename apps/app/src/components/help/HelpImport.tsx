"use client";

import React from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { HelpProposal } from "@featul/api/help/import/generate";
import type {
  HelpImportEvent,
  HelpImportStep,
} from "@featul/api/help/import/handler";
import type { HelpImportUsage } from "@featul/api/help/import/usage";
import { client } from "@featul/api/client";
import { Button } from "@featul/ui/components/button";
import { Checkbox } from "@featul/ui/components/checkbox";
import { Input } from "@featul/ui/components/input";
import { DitherClouds } from "@featul/ui/components/clouds";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogInner,
  DialogTitle,
} from "@featul/ui/components/dialog";
import { raisedCardClass, raisedSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import {
  ArrowRight,
  CheckIcon,
  ChevronDown,
  ExternalLink,
  GitHubIcon,
  LoaderIcon,
  LockIcon,
  SparklesIcon,
  XMarkIcon,
} from "@/components/global/icons";
import { expectOk, useRefreshHelpTree } from "@/hooks/useHelpTree";
import { WebsiteFavicon } from "@/components/wizard/WebsiteFavicon";
import { GithubRepoField, useGithubSetupToast } from "./GithubRepoField";
import { HelpCollectionIcon } from "./icons";
import styles from "./import.module.css";

type Stage = "form" | "running" | "review" | "saving" | "done";
type StepState = "idle" | "running" | "done" | "skipped" | "error";
type SourceRef = { kind: "site" | "repo"; url: string; title: string };
type LogEntry = {
  at: number;
  text: string;
  kind: "step" | "source" | "article";
  source?: SourceRef;
};
type SaveResult = {
  created: number;
  collectionsCreated: number;
  titles: string[];
};

const STEP_LABELS: Record<HelpImportStep, string> = {
  site: "Reading your website",
  repo: "Reading your GitHub repository",
  draft: "Writing draft articles",
};

const cardClass = cn(raisedCardClass, "rounded-2xl");

/** Raised 3D button: lit top edge, gradient body, a darker bottom lip that presses in on click. */
const button3dClass =
  "inline-flex h-9 cursor-pointer items-center justify-center rounded-lg border border-black/[0.12] bg-linear-to-b from-white to-zinc-100 px-4 text-sm font-medium text-zinc-900 shadow-[inset_0_1px_0_rgba(255,255,255,1),inset_0_-2px_0_rgba(0,0,0,0.07),0_1px_2px_rgba(0,0,0,0.12),0_2px_4px_-1px_rgba(0,0,0,0.08)] transition-[transform,box-shadow,filter] duration-100 hover:brightness-[0.98] active:translate-y-px active:shadow-[inset_0_1px_2px_rgba(0,0,0,0.12)] dark:border-white/10 dark:from-zinc-700 dark:to-zinc-800 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_-2px_0_rgba(0,0,0,0.35),0_1px_2px_rgba(0,0,0,0.5)] dark:hover:brightness-110";

/** Hand-written activity log lines for each step transition. */
const STEP_LOG: Record<HelpImportStep, Partial<Record<StepState, string>>> = {
  site: {
    running: "Opening your website",
    done: "Finished reading your website",
    error: "Couldn't read your website",
  },
  repo: {
    running: "Opening your GitHub repository",
    done: "Finished reading your repository",
    error: "Couldn't read your repository",
  },
  draft: {
    running: "Writing draft articles",
    done: "All drafts written",
    error: "Drafting failed",
  },
};

async function readEvents(
  res: Response,
  onEvent: (event: HelpImportEvent) => void,
) {
  const reader = res.body?.getReader();
  if (!reader) throw new Error("Empty response");
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    let boundary = buffer.indexOf("\n\n");
    while (boundary !== -1) {
      const frame = buffer.slice(0, boundary);
      buffer = buffer.slice(boundary + 2);
      boundary = buffer.indexOf("\n\n");
      for (const line of frame.split("\n")) {
        if (line.startsWith("data:"))
          onEvent(JSON.parse(line.slice(5).trim()) as HelpImportEvent);
      }
    }
  }
}

const hostOf = (url: string) => {
  try {
    const u = new URL(url);
    return `${u.hostname.replace(/^www\./, "")}${u.pathname === "/" ? "" : u.pathname}`;
  } catch {
    return url;
  }
};

/**
 * Draft a help center from a website and/or GitHub repo: scan, review, then save as drafts.
 * Used after workspace setup (with `autoStart`) and from Settings → Help Center.
 */
export function HelpImport({
  workspaceSlug,
  initialSite = "",
  initialRepo = "",
  autoStart = false,
  onboarding = false,
}: {
  workspaceSlug: string;
  initialSite?: string;
  initialRepo?: string;
  autoStart?: boolean;
  onboarding?: boolean;
}) {
  const queryClient = useQueryClient();
  const refreshTree = useRefreshHelpTree(workspaceSlug);
  useGithubSetupToast();
  const statusKey = ["help-import-status", workspaceSlug];
  const { data: status } = useQuery<{ plan: string; usage: HelpImportUsage }>({
    queryKey: statusKey,
    queryFn: async () => {
      const res = await client.help.importStatus.$get({ slug: workspaceSlug });
      await expectOk(res, "Couldn't load import settings");
      return (await res.json()) as { plan: string; usage: HelpImportUsage };
    },
  });
  const usage = status?.usage;

  const [site, setSite] = React.useState(initialSite);
  const [repo, setRepo] = React.useState(initialRepo);
  const [stage, setStage] = React.useState<Stage>("form");
  const [steps, setSteps] = React.useState<
    Record<HelpImportStep, { state: StepState; detail?: string }>
  >({
    site: { state: "idle" },
    repo: { state: "idle" },
    draft: { state: "idle" },
  });
  const [sources, setSources] = React.useState<SourceRef[]>([]);
  const [drafting, setDrafting] = React.useState<string[]>([]);
  const [proposal, setProposal] = React.useState<HelpProposal | null>(null);
  const [selected, setSelected] = React.useState<Set<number>>(new Set());
  const [error, setError] = React.useState("");
  const [result, setResult] = React.useState<SaveResult | null>(null);
  const [log, setLog] = React.useState<LogEntry[]>([]);
  const [startedAt, setStartedAt] = React.useState(0);
  const abortRef = React.useRef<AbortController | null>(null);
  const started = React.useRef(false);

  React.useEffect(() => {
    if (!usage) return;
    if (!initialSite && usage.site) setSite(usage.site);
    if (!initialRepo && usage.repo) setRepo(usage.repo);
  }, [usage, initialSite, initialRepo]);

  const scan = React.useCallback(async () => {
    const controller = new AbortController();
    abortRef.current = controller;
    const begin = Date.now();
    const note = (entry: Omit<LogEntry, "at">) =>
      setLog((prev) => [...prev, { ...entry, at: Date.now() - begin }]);
    setStartedAt(begin);
    setLog([]);
    setStage("running");
    setError("");
    setSources([]);
    setDrafting([]);
    setProposal(null);
    setSteps({
      site: { state: "idle" },
      repo: { state: "idle" },
      draft: { state: "idle" },
    });
    try {
      const res = await fetch("/api/help/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: workspaceSlug,
          site: site.trim() || null,
          repo: repo.trim() || null,
        }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(body?.message || "Couldn't start the scan");
      }
      let gotProposal = false;
      await readEvents(res, (event) => {
        if (event.type === "step") {
          setSteps((prev) => ({
            ...prev,
            [event.step]: { state: event.state, detail: event.detail },
          }));
          if (event.state !== "skipped")
            note({
              kind: "step",
              text: `${STEP_LOG[event.step][event.state] ?? STEP_LABELS[event.step]}${event.detail ? ` · ${event.detail}` : ""}`,
            });
        } else if (event.type === "source") {
          setSources((prev) => [...prev, event.source]);
          note({
            kind: "source",
            source: event.source,
            text:
              event.source.title.split(/ [|·–-] /)[0] ??
              hostOf(event.source.url),
          });
        } else if (event.type === "article") {
          setDrafting((prev) => [...prev, event.title]);
          note({ kind: "article", text: event.title });
        } else if (event.type === "proposal") {
          gotProposal = true;
          setProposal(event.proposal);
          setSelected(new Set(event.proposal.articles.map((_, i) => i)));
          setStage("review");
        } else if (event.type === "error") throw new Error(event.message);
      });
      if (!gotProposal)
        throw new Error("The scan ended early. Please try again.");
    } catch (err) {
      setError(
        controller.signal.aborted
          ? "Scan cancelled."
          : err instanceof Error
            ? err.message
            : "Something went wrong",
      );
      setStage("form");
    } finally {
      abortRef.current = null;
      void queryClient.invalidateQueries({ queryKey: statusKey });
    }
    // statusKey is derived from workspaceSlug.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repo, site, workspaceSlug, queryClient]);

  React.useEffect(() => {
    if (autoStart && !started.current && (initialSite || initialRepo)) {
      started.current = true;
      void scan();
    }
  }, [autoStart, initialRepo, initialSite, scan]);

  const save = async () => {
    if (!proposal) return;
    setStage("saving");
    try {
      const articles = proposal.articles.filter((_, i) => selected.has(i));
      const res = await client.help.importApply.$post({
        slug: workspaceSlug,
        collections: proposal.collections,
        articles: articles.map(({ title, summary, collection, body }) => ({
          title,
          summary,
          collection,
          body,
        })),
      });
      await expectOk(res, "Couldn't save the drafts");
      const data = (await res.json()) as {
        created: number;
        collectionsCreated: number;
      };
      setResult({ ...data, titles: articles.map((a) => a.title) });
      await refreshTree();
      setStage("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save the drafts");
      setStage("review");
    }
  };

  const outOfScans = usage ? usage.remaining <= 0 : false;
  const canScan = Boolean(site.trim() || repo.trim()) && !outOfScans;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pb-16 sm:px-6">
      {/* The form stays behind the progress dialog, so cancelling lands back where you were. */}
      {stage === "form" || stage === "running" ? (
        <FormStage
          site={site}
          repo={repo}
          setSite={setSite}
          setRepo={setRepo}
          error={error}
          canScan={canScan && stage === "form"}
          onScan={() => void scan()}
          onboarding={onboarding}
          usage={usage}
          workspaceSlug={workspaceSlug}
        />
      ) : null}

      {stage === "running" ? (
        <RunningDialog
          steps={steps}
          sources={sources}
          drafting={drafting}
          maxArticles={usage?.maxArticles ?? 6}
          startedAt={startedAt}
          log={log}
          onCancel={() => {
            abortRef.current?.abort();
            setError("Scan cancelled.");
            setStage("form");
          }}
        />
      ) : null}

      {(stage === "review" || stage === "saving") && proposal ? (
        <Review
          proposal={proposal}
          sources={sources}
          selected={selected}
          setSelected={setSelected}
          saving={stage === "saving"}
          error={error}
          onSave={() => void save()}
          onDiscard={() => setStage("form")}
        />
      ) : null}

      {stage === "done" && result ? (
        <DoneStage
          result={result}
          workspaceSlug={workspaceSlug}
          onboarding={onboarding}
        />
      ) : null}
    </div>
  );
}

function UsageNote({
  usage,
  workspaceSlug,
}: {
  usage?: HelpImportUsage;
  workspaceSlug: string;
}) {
  if (!usage) return <span />;
  if (usage.remaining <= 0) {
    return (
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <LockIcon className="size-3" />
        {usage.window === "total"
          ? "Your free scan is used."
          : "No scans left this month."}{" "}
        <Link
          href={`/workspaces/${workspaceSlug}/settings/billing`}
          className="font-medium text-primary hover:underline"
        >
          Upgrade to scan again
        </Link>
      </p>
    );
  }
  return (
    <p className="text-xs text-muted-foreground">
      {usage.window === "total"
        ? "Your plan includes 1 scan"
        : `${usage.remaining} of ${usage.limit} scans left this month`}{" "}
      · up to {usage.maxPages} pages and {usage.maxArticles} articles
    </p>
  );
}

function Review({
  proposal,
  sources,
  selected,
  setSelected,
  saving,
  error,
  onSave,
  onDiscard,
}: {
  proposal: HelpProposal;
  sources: SourceRef[];
  selected: Set<number>;
  setSelected: React.Dispatch<React.SetStateAction<Set<number>>>;
  saving: boolean;
  error: string;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const [open, setOpen] = React.useState<number | null>(null);
  const groups = proposal.collections
    .map((collection) => ({
      collection,
      items: proposal.articles
        .map((article, index) => ({ article, index }))
        .filter(
          ({ article }) =>
            article.collection.trim().toLowerCase() ===
            collection.name.trim().toLowerCase(),
        ),
    }))
    .filter((g) => g.items.length > 0);
  const named = new Set(groups.flatMap((g) => g.items.map((i) => i.index)));
  const loose = proposal.articles
    .map((article, index) => ({ article, index }))
    .filter(({ index }) => !named.has(index));
  const toggle = (index: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });

  return (
    <div className="space-y-4">
      <section className={cn(cardClass, "relative isolate overflow-hidden")}>
        <div className="relative isolate overflow-hidden bg-primary px-6 py-6 text-white sm:px-7">
          <div className="absolute inset-0 -z-10 opacity-80">
            <DitherClouds primary fit="cover" />
          </div>
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-linear-to-r from-[var(--primary)] via-[color-mix(in_oklab,var(--primary)_70%,transparent)] to-transparent"
          />
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/75">
                Ready for review
              </p>
              <h1 className="mt-1.5 text-2xl font-semibold tracking-tight">
                {proposal.articles.length} drafts, {groups.length}{" "}
                {groups.length === 1 ? "collection" : "collections"}
              </h1>
              <p className="mt-1 text-sm text-white/80">
                Untick anything you don&apos;t want. Everything is saved as a
                draft.
              </p>
            </div>
            <button
              type="button"
              className="cursor-pointer rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/25"
              onClick={() =>
                setSelected(
                  selected.size === proposal.articles.length
                    ? new Set()
                    : new Set(proposal.articles.map((_, i) => i)),
                )
              }
            >
              {selected.size === proposal.articles.length
                ? "Deselect all"
                : "Select all"}
            </button>
          </div>
        </div>
        {sources.length ? (
          <div className="flex flex-wrap items-center gap-1.5 px-6 py-3 sm:px-7">
            <span className="mr-1 text-xs text-muted-foreground">
              Written from {sources.length} sources
            </span>
            {sources.slice(0, 8).map((source) => (
              <SourceChip key={source.url} source={source} />
            ))}
          </div>
        ) : null}
      </section>

      {[
        ...groups,
        ...(loose.length ? [{ collection: null, items: loose }] : []),
      ].map((group) => (
        <section
          key={group.collection?.name ?? "uncategorized"}
          className={cardClass}
        >
          <header className="flex items-center gap-3 border-b border-border/60 px-5 py-3.5 dark:border-white/[0.07]">
            <span className="flex size-8 items-center justify-center rounded-lg border border-border/70 text-muted-foreground dark:border-white/10">
              <HelpCollectionIcon
                icon={group.collection?.icon ?? "book"}
                className="size-4"
              />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-semibold text-foreground">
                {group.collection?.name ?? "Uncategorized"}
              </h2>
              {group.collection?.description ? (
                <p className="truncate text-xs text-muted-foreground">
                  {group.collection.description}
                </p>
              ) : null}
            </div>
          </header>
          <ul className="divide-y divide-border/50 dark:divide-white/[0.06]">
            {group.items.map(({ article, index }) => (
              <li key={index} className="px-5 py-3.5">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selected.has(index)}
                    onCheckedChange={() => toggle(index)}
                    aria-label={`Include ${article.title}`}
                    className="mt-0.5"
                  />
                  <button
                    type="button"
                    onClick={() => setOpen(open === index ? null : index)}
                    className="min-w-0 flex-1 cursor-pointer text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
                        {article.title}
                      </span>
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 text-muted-foreground transition-transform",
                          open === index && "rotate-180",
                        )}
                      />
                    </span>
                    {article.summary ? (
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {article.summary}
                      </span>
                    ) : null}
                  </button>
                </div>
                {open === index ? (
                  <div className="ml-7 mt-3 rounded-xl bg-muted/50 p-4 dark:bg-white/[0.03]">
                    <MarkdownPreview text={article.body} />
                    {article.sources.length ? (
                      <div className="mt-4 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3 dark:border-white/[0.07]">
                        <span className="text-[11px] text-muted-foreground">
                          Based on
                        </span>
                        {article.sources.map((url) => (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex max-w-64 items-center gap-1 truncate rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground ring-1 ring-border/70 hover:text-foreground dark:ring-white/10"
                          >
                            {hostOf(url)}
                            <ExternalLink className="size-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ))}

      <div className="sticky bottom-4 z-10">
        <div
          className={cn(
            cardClass,
            "flex flex-wrap items-center justify-between gap-3 px-5 py-3 shadow-lg",
          )}
        >
          <p className="text-sm text-muted-foreground">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              `${selected.size} of ${proposal.articles.length} selected`
            )}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="plain"
              onClick={onDiscard}
              disabled={saving}
              className="text-muted-foreground hover:text-foreground"
            >
              Start over
            </Button>
            <Button onClick={onSave} disabled={saving || selected.size === 0}>
              {saving ? <LoaderIcon className="size-4" /> : null}
              Add {selected.size} {selected.size === 1 ? "draft" : "drafts"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SourceChip({ source }: { source: SourceRef }) {
  return (
    <span
      title={source.url}
      className="inline-flex max-w-56 items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[11px] text-muted-foreground animate-in fade-in-0 slide-in-from-bottom-1 dark:bg-white/[0.05]"
    >
      <SourceIcon source={source} className="size-3" />
      <span className="truncate">{hostOf(source.url)}</span>
    </span>
  );
}

/** Preview for generated Markdown: headings, lists, paragraphs and **bold**; links show as text. */
function MarkdownPreview({ text }: { text: string }) {
  const inline = (line: string) =>
    line
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .split(/(\*\*[^*]+\*\*|`[^`]+`)/g)
      .map((part, i) =>
        part.startsWith("**") ? (
          <strong key={i} className="font-semibold text-foreground">
            {part.slice(2, -2)}
          </strong>
        ) : part.startsWith("`") ? (
          <code
            key={i}
            className="rounded bg-background px-1 py-0.5 text-[0.9em] ring-1 ring-border/60"
          >
            {part.slice(1, -1)}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      );
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="space-y-2.5 text-sm leading-relaxed text-foreground/85">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((l) => l.trim());
        const first = lines[0] ?? "";
        if (/^#{2,4}\s/.test(first) && lines.length === 1) {
          return (
            <h3 key={i} className="pt-1 text-sm font-semibold text-foreground">
              {inline(first.replace(/^#+\s/, ""))}
            </h3>
          );
        }
        if (lines.every((l) => /^\s*[-*]\s/.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*]\s/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+[.)]\s/.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+[.)]\s/, ""))}</li>
              ))}
            </ol>
          );
        }
        if (/^#{2,4}\s/.test(first)) {
          return (
            <div key={i} className="space-y-1">
              <h3 className="pt-1 text-sm font-semibold text-foreground">
                {inline(first.replace(/^#+\s/, ""))}
              </h3>
              <p>{inline(lines.slice(1).join(" "))}</p>
            </div>
          );
        }
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}

function SourceIcon({
  source,
  className = "size-3.5",
}: {
  source: SourceRef;
  className?: string;
}) {
  return source.kind === "repo" ? (
    <GitHubIcon className={cn(className, "shrink-0")} />
  ) : (
    <WebsiteFavicon
      domain={new URL(source.url).hostname}
      className={cn(className, "shrink-0 rounded-sm")}
    />
  );
}

/** Brand banner on top of a raised card, shared by the form and progress stages. */
function Banner({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative isolate overflow-hidden bg-primary px-6 pb-7 pt-6 text-white sm:px-8">
      <div className="absolute inset-0 -z-10 opacity-90">
        <DitherClouds primary fit="cover" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-linear-to-r from-[var(--primary)] via-[color-mix(in_oklab,var(--primary)_70%,transparent)] to-transparent"
      />
      {children}
    </div>
  );
}

function FormStage({
  site,
  repo,
  setSite,
  setRepo,
  error,
  canScan,
  onScan,
  onboarding,
  usage,
  workspaceSlug,
}: {
  site: string;
  repo: string;
  setSite: (v: string) => void;
  setRepo: (v: string) => void;
  error: string;
  canScan: boolean;
  onScan: () => void;
  onboarding: boolean;
  usage?: HelpImportUsage;
  workspaceSlug: string;
}) {
  return (
    <form
      className={cn(cardClass, "overflow-hidden")}
      onSubmit={(e) => {
        e.preventDefault();
        if (canScan) onScan();
      }}
    >
      <Banner>
        <span className="flex size-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/25 backdrop-blur-sm">
          <SparklesIcon className="size-5" />
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          {onboarding
            ? "Let's draft your help center"
            : "Draft articles from your website"}
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-white/85">
          We read your site and docs, then write first drafts of the articles
          your customers will need. Nothing is published until you publish it.
        </p>
        <ul className="mt-5 flex flex-wrap gap-2 text-xs text-white/90">
          {[
            "Reads up to " + (usage?.maxPages ?? 6) + " pages",
            "Writes up to " + (usage?.maxArticles ?? 6) + " drafts",
            "You review everything",
          ].map((item) => (
            <li
              key={item}
              className="flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 backdrop-blur-sm"
            >
              <CheckIcon className="size-3" />
              {item}
            </li>
          ))}
        </ul>
      </Banner>

      <div className="space-y-4 p-6 sm:p-8">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium text-foreground">Website</span>
          <span
            className={cn(
              raisedSurfaceClass,
              "flex items-center gap-2.5 rounded-lg px-3 focus-within:border-primary/40 focus-within:ring-3 focus-within:ring-primary/15",
            )}
          >
            <WebsiteFavicon domain={site} className="size-4 rounded-sm" />
            <Input
              variant="plain"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              placeholder="example.com"
              className="h-10 flex-1 px-0"
            />
          </span>
        </label>
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-foreground">
            GitHub repository{" "}
            <span className="font-normal text-muted-foreground">
              (optional)
            </span>
          </span>
          <GithubRepoField
            workspaceSlug={workspaceSlug}
            value={repo}
            onChange={setRepo}
          />
        </div>

        {error ? <p className="text-sm text-destructive">{error}</p> : null}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <UsageNote usage={usage} workspaceSlug={workspaceSlug} />
          <div className="flex items-center gap-2">
            {onboarding ? (
              <Button
                asChild
                variant="plain"
                className="text-muted-foreground hover:text-foreground"
              >
                <Link href={`/workspaces/${workspaceSlug}?welcome=1`}>
                  Skip for now
                </Link>
              </Button>
            ) : null}
            <Button type="submit" disabled={!canScan}>
              Scan and draft
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

const formatElapsed = (ms: number) => {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
};

/**
 * Drafting progress in a dialog over the start form: a progress ring and the real milestones,
 * the item being worked on now, and a short timeline of what's been read and drafted.
 * Not dismissable by clicking outside; Cancel stops the scan.
 */
function RunningDialog({
  steps,
  sources,
  drafting,
  maxArticles,
  startedAt,
  log,
  onCancel,
}: {
  steps: Record<HelpImportStep, { state: StepState; detail?: string }>;
  sources: SourceRef[];
  drafting: string[];
  maxArticles: number;
  startedAt: number;
  log: LogEntry[];
  onCancel: () => void;
}) {
  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const writingPhase =
    steps.draft.state === "running" || steps.draft.state === "done";
  const current = sources[sources.length - 1];
  const latest = drafting[drafting.length - 1];
  const status = writingPhase
    ? latest
      ? `Writing “${latest}”`
      : "Planning your collections"
    : current
      ? `Reading ${hostOf(current.url).split("/")[0]}`
      : steps.repo.state === "running"
        ? "Opening your GitHub repository"
        : "Opening your website";

  // Each source read counts for a quarter; drafting fills the remaining half.
  const finished = (state: StepState) =>
    state === "done" || state === "skipped" || state === "error";
  const progress =
    (finished(steps.site.state) ? 0.25 : 0) +
    (finished(steps.repo.state) ? 0.25 : 0) +
    (steps.draft.state === "done"
      ? 0.5
      : (drafting.length / Math.max(1, maxArticles)) * 0.5);
  const percent = Math.round(progress * 100);

  const checklist: Array<{
    key: string;
    label: string;
    state: StepState;
    detail?: string;
  }> = [
    { key: "site", label: "Website", ...steps.site },
    { key: "repo", label: "GitHub repo", ...steps.repo },
    {
      key: "draft",
      label: "Drafts",
      ...steps.draft,
      detail:
        steps.draft.state === "running"
          ? `${drafting.length} of ${maxArticles}`
          : steps.draft.detail,
    },
    { key: "review", label: "Review", state: "idle" },
  ];
  const timeline = log
    .filter((entry) => entry.kind !== "step")
    .slice()
    .reverse();
  const lastArticleAt = timeline.findIndex((entry) => entry.kind === "article");
  const listRef = React.useRef<HTMLOListElement>(null);
  const [moreBelow, setMoreBelow] = React.useState(false);
  const updateFade = React.useCallback(() => {
    const el = listRef.current;
    setMoreBelow(
      Boolean(el && el.scrollHeight - el.scrollTop - el.clientHeight > 4),
    );
  }, []);
  React.useEffect(() => updateFade(), [timeline.length, updateFade]);

  return (
    <Dialog open onOpenChange={() => {}}>
      <DialogContent
        fluid
        showCloseButton={false}
        className="w-[min(94vw,40rem)]"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <DialogTitle className="mt-0.5 flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
            <SparklesIcon className="size-3.5 text-primary" />
            Drafting your help center
          </DialogTitle>
          <span className="px-2 text-xs tabular-nums text-muted-foreground">
            {formatElapsed(now - startedAt)}
          </span>
        </DialogHeader>
        <DialogInner className="p-0" aria-live="polite">
          {/* Pattern banner: the ring and what's being worked on right now. */}
          <div className="relative isolate overflow-hidden bg-primary px-5 py-6 text-white sm:px-6">
            <div className="absolute inset-0 -z-10">
              <DitherClouds primary fit="cover" />
            </div>
            <div
              aria-hidden
              className="absolute inset-0 -z-10 bg-linear-to-r from-[var(--primary)] via-[color-mix(in_oklab,var(--primary)_55%,transparent)] to-transparent"
            />
            <div className="flex items-center gap-5">
              <div
                role="progressbar"
                aria-label="Drafting progress"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percent}
                className="flex size-24 shrink-0 items-center justify-center rounded-[50%] shadow-lg shadow-black/15 transition-[background] duration-500"
                style={{
                  background: `conic-gradient(#fff ${percent * 3.6}deg, rgba(255,255,255,0.25) 0)`,
                }}
              >
                <span className="flex size-[4.75rem] items-center justify-center rounded-[50%] bg-[var(--primary)] text-xl font-semibold tabular-nums">
                  {percent}%
                </span>
              </div>
              <div className="min-w-0">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                  <LoaderIcon className="size-3" />
                  {writingPhase
                    ? latest
                      ? `Writing · article ${drafting.length} of up to ${maxArticles}`
                      : "Planning"
                    : "Reading"}
                </span>
                <p
                  key={status}
                  className="mt-2 line-clamp-2 text-lg font-semibold leading-snug tracking-tight animate-in fade-in-0 duration-300"
                >
                  {writingPhase
                    ? (latest ?? "Planning your collections")
                    : (current?.title.split(/ [|·–-] /)[0] ??
                      "Finding your most helpful pages")}
                </p>
                <p className="mt-0.5 truncate text-xs text-white/80">
                  {writingPhase
                    ? "Drafted from your pages and docs"
                    : current
                      ? hostOf(current.url)
                      : "Connecting…"}
                </p>
              </div>
            </div>
          </div>

          {/* Milestones */}
          <ol className="grid grid-cols-2 border-b border-border/60 sm:grid-cols-4 dark:border-white/[0.07]">
            {checklist.map((step, i) => (
              <li
                key={step.key}
                className={cn(
                  "flex items-center gap-2.5 px-4 py-3",
                  i > 0 &&
                    "sm:border-l border-border/60 dark:border-white/[0.07]",
                  step.state === "skipped" && "opacity-50",
                )}
              >
                <span
                  className={cn(
                    "flex size-[18px] shrink-0 items-center justify-center rounded-[50%]",
                    step.state === "done" &&
                      "bg-primary text-primary-foreground",
                    step.state === "running" && "text-primary",
                    step.state === "error" &&
                      "bg-rose-500/15 text-rose-600 dark:text-rose-400",
                    (step.state === "idle" || step.state === "skipped") &&
                      "border border-border dark:border-white/15",
                  )}
                >
                  {step.state === "done" ? (
                    <CheckIcon className="size-2.5" />
                  ) : step.state === "running" ? (
                    <LoaderIcon className="size-3.5" />
                  ) : step.state === "error" ? (
                    <XMarkIcon className="size-2.5" />
                  ) : null}
                </span>
                <span className="min-w-0">
                  <span
                    className={cn(
                      "block truncate text-[13px] font-medium",
                      step.state === "idle"
                        ? "text-muted-foreground"
                        : "text-foreground",
                    )}
                  >
                    {step.label}
                  </span>
                  <span className="block truncate text-[11px] text-muted-foreground">
                    {step.state === "skipped"
                      ? "Skipped"
                      : (step.detail ??
                        (step.state === "done"
                          ? "Done"
                          : step.state === "running"
                            ? "In progress"
                            : "Up next"))}
                  </span>
                </span>
              </li>
            ))}
          </ol>

          {/* Timeline */}
          <div>
            {timeline.length === 0 ? (
              <p className="px-5 py-4 text-sm text-muted-foreground">
                Getting started…
              </p>
            ) : (
              <div className="relative">
                <ol
                  ref={listRef}
                  onScroll={updateFade}
                  className="max-h-56 overflow-y-auto"
                >
                  {timeline.map((entry, i) => {
                    const live =
                      entry.kind === "article"
                        ? i === lastArticleAt && steps.draft.state === "running"
                        : !writingPhase && i === 0;
                    return (
                      <li
                        key={`${entry.at}-${i}`}
                        className="grid grid-cols-[2.5rem_1rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-dashed border-border/70 px-5 py-2 text-[13px] last:border-0 animate-in fade-in-0 duration-300 dark:border-white/[0.07]"
                      >
                        <span className="text-[11px] tabular-nums text-muted-foreground">
                          {formatElapsed(entry.at)}
                        </span>
                        <span className="flex justify-center">
                          {entry.kind === "article" ? (
                            live ? (
                              <LoaderIcon className="size-3.5 text-primary" />
                            ) : (
                              <span className="flex size-3.5 items-center justify-center rounded-[50%] bg-primary text-primary-foreground">
                                <CheckIcon className="size-2" />
                              </span>
                            )
                          ) : entry.source ? (
                            <SourceIcon
                              source={entry.source}
                              className="size-3.5"
                            />
                          ) : null}
                        </span>
                        <span
                          className={cn(
                            "truncate",
                            live
                              ? "font-medium text-foreground"
                              : "text-foreground/85",
                          )}
                        >
                          {entry.kind === "article"
                            ? live
                              ? `Writing “${entry.text}”`
                              : `Drafted “${entry.text}”`
                            : `Read ${entry.text}`}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                            live
                              ? "bg-primary/10 text-primary"
                              : "bg-muted text-muted-foreground dark:bg-white/[0.06]",
                          )}
                        >
                          {entry.kind === "article"
                            ? live
                              ? "Writing"
                              : "Draft"
                            : entry.source?.kind === "repo"
                              ? "GitHub"
                              : "Website"}
                        </span>
                      </li>
                    );
                  })}
                </ol>
                {/* Fades the bottom edge while there are more rows to scroll to. */}
                <div
                  aria-hidden
                  className={cn(
                    "pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-t from-card to-transparent transition-opacity duration-200 dark:from-background",
                    moreBelow ? "opacity-100" : "opacity-0",
                  )}
                />
              </div>
            )}
          </div>
        </DialogInner>
        <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-2">
          <span className="text-xs text-muted-foreground">
            Usually under a minute · drafts are never published automatically
          </span>
          <button type="button" onClick={onCancel} className={button3dClass}>
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DoneStage({
  result,
  workspaceSlug,
  onboarding,
}: {
  result: SaveResult;
  workspaceSlug: string;
  onboarding: boolean;
}) {
  const fan = result.titles.slice(0, 3);
  const angles =
    fan.length === 1 ? [0] : fan.length === 2 ? [-6, 6] : [-9, 0, 9];
  const next = [
    {
      title: "Read and edit each draft",
      body: "Fix anything that's off and add screenshots.",
      href: `/workspaces/${workspaceSlug}/help`,
    },
    {
      title: "Publish the ones you're happy with",
      body: "Drafts stay private until you switch them on.",
      href: `/workspaces/${workspaceSlug}/help`,
    },
    {
      title: "Show articles where people ask",
      body: "Turn on help articles in your widget and Ask AI.",
      href: `/workspaces/${workspaceSlug}/settings/help`,
    },
  ];
  return (
    <section className={cn(cardClass, "overflow-hidden")}>
      <div className="relative isolate overflow-hidden bg-primary px-6 pb-9 pt-10 text-center text-white sm:px-10">
        <div className="absolute inset-0 -z-10">
          <DitherClouds multicolor fit="cover" />
        </div>
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/0 via-black/0 to-black/25" />

        <div className="relative mx-auto h-40 max-w-sm" aria-hidden>
          {fan.map((title, i) => (
            <div
              key={title}
              className={cn(
                "absolute left-1/2 top-5 h-32 w-64 rounded-xl bg-white p-4 text-left text-zinc-900 shadow-2xl shadow-black/25",
                styles.fan,
              )}
              style={{
                rotate: `${angles[i]}deg`,
                translate: `calc(-50% + ${angles[i]! * 9}px) ${Math.abs(angles[i]!) * 1.2}px`,
                animationDelay: `${0.12 * i}s`,
                // The middle card sits on top, so its title is the one that reads.
                zIndex: fan.length === 3 && i === 1 ? 3 : i,
              }}
            >
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                Draft
              </span>
              <p className="mt-2 line-clamp-2 text-sm font-semibold leading-snug">
                {title}
              </p>
              <span className="mt-2 block h-1.5 w-11/12 rounded-full bg-zinc-100" />
              <span className="mt-1.5 block h-1.5 w-3/4 rounded-full bg-zinc-100" />
            </div>
          ))}
          <span className="absolute right-6 top-0 z-10 flex size-11 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg ring-4 ring-white/30">
            <span
              className={cn(
                "absolute inset-0 rounded-full bg-emerald-400",
                styles.ring,
              )}
            />
            <CheckIcon className="relative size-5" />
          </span>
        </div>

        <h1 className="mt-6 text-2xl font-semibold tracking-tight sm:text-3xl">
          Your help center has a head start
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-white/85">
          {result.created} {result.created === 1 ? "draft" : "drafts"}
          {result.collectionsCreated > 0
            ? ` in ${result.collectionsCreated} new ${result.collectionsCreated === 1 ? "collection" : "collections"}`
            : ""}
          , saved privately and ready for your review.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link
            href={`/workspaces/${workspaceSlug}/help`}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-zinc-900 shadow-md shadow-black/10 transition-colors hover:bg-white/90"
          >
            Review drafts
            <ArrowRight className="size-4" />
          </Link>
          {onboarding ? (
            <Link
              href={`/workspaces/${workspaceSlug}?welcome=1`}
              className="inline-flex h-9 items-center rounded-lg bg-white/15 px-4 text-sm font-medium text-white ring-1 ring-white/25 backdrop-blur-sm transition-colors hover:bg-white/25"
            >
              Go to dashboard
            </Link>
          ) : null}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Next steps
        </p>
        <ol className="mt-3 grid gap-3 sm:grid-cols-3">
          {next.map((item, i) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className="group/next flex h-full flex-col rounded-xl border border-border/70 p-4 transition-colors hover:border-primary/40 hover:bg-primary/[0.03] dark:border-white/[0.08]"
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold tabular-nums text-primary">
                  {i + 1}
                </span>
                <span className="mt-3 text-sm font-medium text-foreground">
                  {item.title}
                </span>
                <span className="mt-1 text-xs text-muted-foreground">
                  {item.body}
                </span>
                <ArrowRight className="mt-auto size-3.5 self-end pt-0 text-muted-foreground transition-transform group-hover/next:translate-x-0.5 group-hover/next:text-primary" />
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
