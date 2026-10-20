"use client";

import React from "react";
import Link from "next/link";
import type { HelpAskEvent, HelpAskSource } from "@featul/api/help/ask";
import { Button } from "@featul/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogInner,
  DialogTitle,
} from "@featul/ui/components/dialog";
import { cn } from "@featul/ui/lib/utils";
import { ArticleIcon, ArrowRight, LoaderIcon, SparklesIcon } from "@/components/global/icons";
import { HelpAskButton } from "./HelpAskButton";
import { helpArticleHref } from "./content";

type Status = "idle" | "thinking" | "answering" | "done" | "no_answer" | "error";

/** Reads `data:` frames from the Ask AI stream until it ends. */
async function readEvents(res: Response, onEvent: (event: HelpAskEvent) => void) {
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
        if (line.startsWith("data:")) onEvent(JSON.parse(line.slice(5).trim()) as HelpAskEvent);
      }
    }
  }
}

/** Ask AI: a grounded answer from the help articles, with the articles it used. */
export function HelpAskDialog({
  slug,
  open,
  onOpenChange,
  initialQuestion,
}: {
  slug: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialQuestion: string;
}) {
  const [question, setQuestion] = React.useState(initialQuestion);
  const [asked, setAsked] = React.useState("");
  const [answer, setAnswer] = React.useState("");
  const [sources, setSources] = React.useState<HelpAskSource[]>([]);
  const [status, setStatus] = React.useState<Status>("idle");
  const [error, setError] = React.useState("");
  const abortRef = React.useRef<AbortController | null>(null);

  const ask = React.useCallback(
    async (text: string) => {
      const q = text.trim();
      if (q.length < 3) return;
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setAsked(q);
      setAnswer("");
      setSources([]);
      setError("");
      setStatus("thinking");
      try {
        const res = await fetch("/api/help/ask", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug, question: q }),
          signal: controller.signal,
        });
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { message?: string } | null;
          throw new Error(body?.message || "Couldn't get an answer");
        }
        await readEvents(res, (event) => {
          if (event.type === "sources") setSources(event.articles);
          else if (event.type === "delta") {
            setStatus("answering");
            setAnswer((prev) => prev + event.text);
          } else if (event.type === "done") setStatus("done");
          else if (event.type === "no_answer") setStatus("no_answer");
          else if (event.type === "error") {
            setError(event.message);
            setStatus("error");
          }
        });
      } catch (err) {
        if (controller.signal.aborted) return;
        setError(err instanceof Error ? err.message : "Couldn't get an answer");
        setStatus("error");
      }
    },
    [slug],
  );

  // Each time the dialog opens, ask whatever was typed into the search box.
  React.useEffect(() => {
    if (!open) {
      abortRef.current?.abort();
      return;
    }
    setQuestion(initialQuestion);
    void ask(initialQuestion);
  }, [open, initialQuestion, ask]);

  const busy = status === "thinking" || status === "answering";
  // Once the answer cites articles, list only those, keeping their citation numbers.
  const cited = new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));
  const shownSources = sources
    .map((source, index) => ({ source, number: index + 1 }))
    .filter(({ number }) => cited.size === 0 || cited.has(number));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fluid className="w-[min(92vw,560px)]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <DialogTitle className="mt-0.5 flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
            <SparklesIcon className="size-3.5 text-primary" />
            Ask AI
          </DialogTitle>
        </DialogHeader>
        <DialogInner className="max-h-[70vh] space-y-5 overflow-y-auto pb-4 pt-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void ask(question);
            }}
            className="flex items-center gap-2"
          >
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={300}
              placeholder="Ask a question"
              aria-label="Your question"
              className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-base outline-none focus:ring-3 focus:ring-primary/15 sm:text-sm dark:border-white/10"
            />
            <Button type="submit" size="sm" disabled={busy || question.trim().length < 3} className="h-10">
              {busy ? <LoaderIcon className="size-4" /> : <ArrowRight className="size-4" />}
              <span className="sr-only">Ask</span>
            </Button>
          </form>

          {asked ? (
            <div aria-live="polite" className="space-y-4">
              {status === "thinking" ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoaderIcon className="size-4" />
                  Reading the help articles…
                </p>
              ) : null}

              {answer ? <AnswerText text={answer} sources={sources} onNavigate={() => onOpenChange(false)} /> : null}

              {status === "no_answer" ? (
                <div className="rounded-lg border border-border/70 p-4 text-sm dark:border-white/10">
                  <p className="font-medium text-foreground">The help articles don&apos;t cover this yet.</p>
                  <p className="mt-1 text-muted-foreground">Ask the team on the board and they&apos;ll get back to you.</p>
                  <HelpAskButton className="mt-3" />
                </div>
              ) : null}

              {status === "error" ? <p className="text-sm text-destructive">{error}</p> : null}

              {sources.length > 0 && (status === "done" || status === "answering") ? (
                <div>
                  <p className="mb-1.5 text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">
                    Sources
                  </p>
                  <ol className="space-y-0.5">
                    {shownSources.map(({ source, number }) => (
                      <li key={source.id}>
                        <Link
                          href={helpArticleHref(source.slug)}
                          onClick={() => onOpenChange(false)}
                          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-muted dark:hover:bg-white/[0.06]"
                        >
                          <span className="flex size-5 shrink-0 items-center justify-center rounded-md bg-muted text-[11px] font-medium tabular-nums text-muted-foreground dark:bg-white/[0.06]">
                            {number}
                          </span>
                          <ArticleIcon className="size-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1 truncate font-medium text-foreground">{source.title}</span>
                          {source.collectionName ? (
                            <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
                              {source.collectionName}
                            </span>
                          ) : null}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {status === "done" ? (
                <p className="text-[11px] text-muted-foreground">
                  AI answers can be wrong. Check the linked articles for the details.
                </p>
              ) : null}
            </div>
          ) : null}
        </DialogInner>
      </DialogContent>
    </Dialog>
  );
}

/** Plain-text answer: paragraphs, `- ` and `1.` lists, and [n] citations linked to sources. */
function AnswerText({
  text,
  sources,
  onNavigate,
}: {
  text: string;
  sources: HelpAskSource[];
  onNavigate: () => void;
}) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className="space-y-3 text-[15px] leading-relaxed text-foreground sm:text-sm">
      {blocks.map((block, i) => {
        const lines = block.split("\n").filter((line) => line.trim());
        const bullet = lines.every((line) => /^\s*[-*•]\s+/.test(line));
        const numbered = lines.every((line) => /^\s*\d+[.)]\s+/.test(line));
        if (bullet || numbered) {
          const Tag = numbered ? "ol" : "ul";
          return (
            <Tag key={i} className={cn("space-y-1 pl-5", numbered ? "list-decimal" : "list-disc")}>
              {lines.map((line, j) => (
                <li key={j}>
                  <Cited text={line.replace(/^\s*(?:[-*•]|\d+[.)])\s+/, "")} sources={sources} onNavigate={onNavigate} />
                </li>
              ))}
            </Tag>
          );
        }
        return (
          <p key={i}>
            <Cited text={lines.join(" ")} sources={sources} onNavigate={onNavigate} />
          </p>
        );
      })}
    </div>
  );
}

function Cited({
  text,
  sources,
  onNavigate,
}: {
  text: string;
  sources: HelpAskSource[];
  onNavigate: () => void;
}) {
  const parts = text.split(/(\[\d+\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = /^\[(\d+)\]$/.exec(part);
        const source = match ? sources[Number(match[1]) - 1] : undefined;
        if (!match) return <React.Fragment key={i}>{part}</React.Fragment>;
        if (!source) return null;
        return (
          <Link
            key={i}
            href={helpArticleHref(source.slug)}
            title={source.title}
            onClick={onNavigate}
            className="mx-0.5 inline-flex size-4 -translate-y-px items-center justify-center rounded bg-primary/10 align-middle text-[10px] font-medium tabular-nums text-primary hover:bg-primary/20"
          >
            {match[1]}
          </Link>
        );
      })}
    </>
  );
}
