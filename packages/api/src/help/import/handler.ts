import { eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";
import { helpArticle } from "@featul/db";
import { authorizePrivateChangelogAiRequest, changelogAiJsonResponse } from "../../ai/auth";
import { createSseStreamHeaders } from "../../ai/sse";
import { readBoundedJson } from "../../request/json";
import { getWorkspaceAccessPlan, requireBoardManagerBySlug } from "../../shared/access";
import { ImportFetchError } from "./fetch";
import { draftHelpCenter, type HelpProposal } from "./generate";
import { readRepo } from "./repo";
import { readSite, type ImportSource } from "./site";
import { getHelpImportUsage, reserveHelpImport } from "./usage";

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

      try {
        if (input.site) {
          send({ type: "step", step: "site", state: "running" });
          try {
            const pages = await readSite(input.site, usage.maxPages, report);
            sources.push(...pages);
            send({ type: "step", step: "site", state: "done", detail: `${pages.length} pages` });
          } catch (error) {
            const detail = error instanceof Error ? error.message : "Couldn't read the website";
            send({ type: "step", step: "site", state: "error", detail });
          }
        } else send({ type: "step", step: "site", state: "skipped" });

        if (input.repo) {
          send({ type: "step", step: "repo", state: "running" });
          try {
            const files = await readRepo(input.repo, Math.max(3, Math.round(usage.maxPages / 2)), report);
            sources.push(...files);
            send({ type: "step", step: "repo", state: "done", detail: `${files.length} files` });
          } catch (error) {
            const detail =
              error instanceof ImportFetchError || error instanceof Error ? error.message : "Couldn't read the repository";
            send({ type: "step", step: "repo", state: "error", detail });
          }
        } else send({ type: "step", step: "repo", state: "skipped" });

        if (sources.length === 0) {
          send({ type: "error", message: "We couldn't read anything useful from those links." });
          return;
        }

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
      } catch (error) {
        console.error("[help-import] failed", error);
        send({ type: "error", message: "Drafting failed. Please try again." });
      } finally {
        clearTimeout(timeout);
        if (!cancelled) controller.close();
      }
    },
    cancel() {
      cancelled = true;
      upstream.abort();
    },
  });

  return new Response(stream, { headers: createSseStreamHeaders() });
}
