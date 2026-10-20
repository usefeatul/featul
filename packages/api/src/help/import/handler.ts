import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { helpArticle } from "@featul/db";
import { authorizePrivateChangelogAiRequest, changelogAiJsonResponse } from "../../ai/auth";
import { createSseStreamHeaders } from "../../ai/sse";
import { readBoundedJson } from "../../request/json";
import { getWorkspaceAccessPlan, requireBoardManagerBySlug } from "../../shared/access";
import { ImportFetchError, normalizeSiteUrl } from "./fetch";
import { draftHelpCenter, type HelpProposal } from "./generate";
import { parseGithubRepo, readRepo } from "./repo";
import { readSite, type ImportSource } from "./site";
import { getHelpImportUsage, releaseHelpImport, reserveHelpImport } from "./usage";
import { createInstallationToken } from "../../services/github-app";
import { clearHelpGithubConnection, getHelpGithubInstallationFor } from "./github";

export type HelpImportStep = "site" | "repo" | "draft";

export type HelpImportEvent =
  | { type: "step"; step: HelpImportStep; state: "running" | "done" | "skipped" | "error"; detail?: string }
  | { type: "source"; source: Pick<ImportSource, "kind" | "url" | "title"> }
  | { type: "article"; title: string }
  | { type: "proposal"; proposal: HelpProposal }
  | { type: "error"; message: string };

const inputSchema = z
  .object({
    slug: z.string().trim().min(1).max(64),
    site: z.string().trim().max(300).optional().nullable(),
    repo: z.string().trim().max(300).optional().nullable(),
  })
  .refine((v) => Boolean(v.site || v.repo), { message: "Add a website or a GitHub repository" });

const encode = (event: HelpImportEvent) => `data: ${JSON.stringify(event)}\n\n`;

/** Only our own fetch errors are meant for users; anything else may carry internals like SQL. */
const userMessage = (error: unknown, fallback: string) => (error instanceof ImportFetchError ? error.message : fallback);

/** Scans a website and/or public GitHub repo and streams a draft help center proposal. */
export async function createHelpImportResponse(req: Request) {
  const auth = await authorizePrivateChangelogAiRequest(req);
  if (auth instanceof Response) return auth;

  let input: z.infer<typeof inputSchema>;
  try {
    input = inputSchema.parse(await readBoundedJson(req, 8 * 1024));
  } catch (error) {
    const message =
      error instanceof z.ZodError ? (error.issues[0]?.message ?? "Invalid request") : "Invalid request";
    return changelogAiJsonResponse(400, { message });
  }

  const { db } = await import("@featul/db");
  let workspace: { id: string; name?: string | null };
  try {
    workspace = await requireBoardManagerBySlug({ db, session: auth.session }, input.slug);
  } catch (err) {
    return changelogAiJsonResponse(err instanceof HTTPException ? err.status : 403, {
      message: err instanceof HTTPException ? err.message : "Forbidden",
    });
  }

  // Reject bad links before a scan is counted.
  const repo = input.repo ? parseGithubRepo(input.repo) : null;
  if (input.repo && !repo) {
    return changelogAiJsonResponse(400, { message: "Enter a GitHub repository like github.com/owner/repo" });
  }
  if (input.site) {
    try {
      normalizeSiteUrl(input.site);
    } catch (error) {
      return changelogAiJsonResponse(400, { message: userMessage(error, "Enter a full website address, like example.com") });
    }
  }

  const plan = await getWorkspaceAccessPlan(workspace.id);
  const usage = await getHelpImportUsage(db, workspace.id, plan);
  const reserved = await reserveHelpImport(db, {
    workspaceId: workspace.id,
    plan,
    site: input.site || null,
    repo: input.repo || null,
  });
  if (!reserved) {
    return changelogAiJsonResponse(429, {
      message:
        usage.window === "total"
          ? "Your free scan has been used. Upgrade to scan again from Settings."
          : "You've used this month's scans. They reset on the 1st.",
    });
  }

  const upstream = new AbortController();
  const timeout = setTimeout(() => upstream.abort(), 240_000);
  let cancelled = false;
  req.signal.addEventListener("abort", () => {
    cancelled = true;
    upstream.abort();
  });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (event: HelpImportEvent) => {
        if (!cancelled) controller.enqueue(encoder.encode(encode(event)));
      };
      const report = (source: ImportSource) =>
        send({ type: "source", source: { kind: source.kind, url: source.url, title: source.title } });
      const sources: ImportSource[] = [];
      // The scan is given back unless a draft was delivered, or the visitor cancelled mid-draft.
      let keepScan = false;
      let drafting = false;

      try {
        if (input.site) {
          send({ type: "step", step: "site", state: "running" });
          try {
            const pages = await readSite(input.site, usage.maxPages, report);
            sources.push(...pages);
            send({ type: "step", step: "site", state: "done", detail: `${pages.length} pages` });
          } catch (error) {
            send({ type: "step", step: "site", state: "error", detail: userMessage(error, "Couldn't read the website") });
          }
        } else send({ type: "step", step: "site", state: "skipped" });

        if (input.repo) {
          send({ type: "step", step: "repo", state: "running" });
          try {
            // A connected GitHub App lets the scan read private repos; public ones work without it.
            const installationId = repo
              ? await getHelpGithubInstallationFor(db, workspace.id, `${repo.owner}/${repo.repo}`)
              : null;
            let githubToken: string | undefined;
            if (installationId) {
              try {
                githubToken = await createInstallationToken(installationId);
              } catch (error) {
                // Uninstalled on GitHub's side: forget the stale connection.
                if (error instanceof HTTPException && error.status === 404) {
                  await clearHelpGithubConnection(db, workspace.id);
                }
                throw new ImportFetchError("Your GitHub connection needs attention. Reconnect GitHub, then try again.");
              }
            }
            const files = await readRepo(input.repo, Math.max(3, Math.round(usage.maxPages / 2)), report, githubToken);
            sources.push(...files);
            send({ type: "step", step: "repo", state: "done", detail: `${files.length} files` });
          } catch (error) {
            send({ type: "step", step: "repo", state: "error", detail: userMessage(error, "Couldn't read the repository") });
          }
        } else send({ type: "step", step: "repo", state: "skipped" });

        if (sources.length === 0) {
          send({ type: "error", message: "We couldn't read anything useful from those links." });
          return;
        }

        if (cancelled) return;
        drafting = true;
        send({ type: "step", step: "draft", state: "running" });
        const existing = await db
          .select({ title: helpArticle.title })
          .from(helpArticle)
          .where(eq(helpArticle.workspaceId, workspace.id));
        const proposal = await draftHelpCenter({
          workspaceName: workspace.name?.trim() || "this product",
          maxArticles: usage.maxArticles,
          sources,
          existingTitles: existing.map((row: { title: string }) => row.title),
          signal: upstream.signal,
          onArticle: (title) => send({ type: "article", title }),
        });
        send({ type: "step", step: "draft", state: "done", detail: `${proposal.articles.length} articles` });
        send({ type: "proposal", proposal });
        keepScan = true;
      } catch (error) {
        if (!cancelled) {
          console.error("[help-import] failed", error);
          send({ type: "error", message: "Drafting failed. Please try again." });
        }
      } finally {
        clearTimeout(timeout);
        if (!cancelled) controller.close();
        // Cancelling during drafting still used a model call, so that scan counts.
        if (!keepScan && !(cancelled && drafting)) {
          await releaseHelpImport(db, { workspaceId: workspace.id, plan }).catch((error: unknown) =>
            console.error("[help-import] couldn't release scan", error),
          );
        }
      }
    },
    cancel() {
      cancelled = true;
      upstream.abort();
    },
  });

  return new Response(stream, { headers: createSseStreamHeaders() });
}
