"use client";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { SkyPageShell } from "@/components/layout/shell";
import { getDefinitionContent } from "@/content/definitions";
import type { Definition } from "@/types/definitions";
import { OverlayCard, OverlayCardPanel } from "@/components/shared/overlay-card";
import { useIsMobile } from "@featul/ui/hooks/use-mobile";

export default function DefinitionDetail({ def }: { def: Definition }) {
  const overview = def.overview ?? `${def.practical} ${def.expert}`;
  const full = getDefinitionContent(def);
  const formatPublishedLabel = (input?: string): string => {
    const base = input || "2025-11-13";
    const normalized = (() => {
      const v = base.replace(/\//g, "-");
      const m = v.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
      if (!m) return v;
      const y = m[1];
      const mm = m[2]!.padStart(2, "0");
      const dd = m[3]!.padStart(2, "0");
      return `${y}-${mm}-${dd}`;
    })();
    const d = new Date(normalized);
    if (Number.isNaN(d.getTime())) {
      return new Date("2025-11-13").toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };
  const publishedLabel = formatPublishedLabel(def.publishedAt);
  const author = def.author ?? "Jean Daly";
  const isMobile = useIsMobile();
  return (
    <SkyPageShell
      dataComponent="DefinitionDetail"
      title={def.name}
      description={def.short}
      meta={
        <div className="mb-2 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Link
              href="/definitions"
              className="inline-flex items-center gap-1 text-sm text-accent hover:text-foreground"
            >
              <ChevronLeft className="size-4" />
              Back
            </Link>
            <span className="mt-0.5 min-w-0 flex-1 truncate text-xs uppercase tracking-wide text-accent">
              {def.eli5}
            </span>
          </div>
          {isMobile ? (
            <div className="text-xs text-accent">
              <span>Published on {publishedLabel}</span>
              <span className="mx-2">•</span>
              <span>Written by {author}</span>
            </div>
          ) : null}
        </div>
      }
    >
      <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
        <div className="space-y-10">
          <section>
            <h2 className="text-lg font-semibold text-foreground">Overview</h2>
            <div className="mt-2 space-y-4 text-sm leading-7 text-accent sm:text-base">
              {def.essay?.intro ? <p>{def.essay.intro}</p> : null}
              <p>{overview}</p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-foreground">Definition</h2>
            <div className="mt-2 space-y-4 text-sm leading-7 text-accent sm:text-base">
              {def.essay?.analysis ? <p>{def.essay.analysis}</p> : null}
              <p>{full}</p>
            </div>
          </section>

          {def.formula ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                {def.formula.title}
              </h2>
              <div className="mt-2 space-y-4 text-sm leading-7 text-accent sm:text-base">
                <p>{def.formula.body}</p>
                {def.essay?.formulaContext ? (
                  <p>{def.essay.formulaContext}</p>
                ) : null}
              </div>
              {def.formula.code ? (
                <OverlayCard className="mt-4">
                  <OverlayCardPanel className="p-0">
                    <pre className="whitespace-pre-wrap px-4 py-3 text-sm text-foreground">
                      {def.formula.code}
                    </pre>
                  </OverlayCardPanel>
                </OverlayCard>
              ) : null}
            </section>
          ) : null}

          {def.example ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                {def.example.title}
              </h2>
              <div className="mt-2 space-y-4 text-sm leading-7 text-accent sm:text-base">
                <p>{def.example.body}</p>
                {def.essay?.exampleContext ? (
                  <p>{def.essay.exampleContext}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {def.pitfalls && def.pitfalls.length ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Common pitfalls
              </h2>
              <div className="mt-2 space-y-4 text-sm leading-7 text-accent sm:text-base">
                {def.essay?.pitfallsContext ? (
                  <p>{def.essay.pitfallsContext}</p>
                ) : null}
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-accent sm:text-base">
                {def.pitfalls.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {def.benchmarks ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Benchmarks
              </h2>
              <div className="mt-2 space-y-4 text-sm leading-7 text-accent sm:text-base">
                <p>{def.benchmarks}</p>
                {def.essay?.benchmarksContext ? (
                  <p>{def.essay.benchmarksContext}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {def.notes && def.notes.length ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground">Notes</h2>
              <div className="mt-2 space-y-4 text-sm leading-7 text-accent sm:text-base">
                {def.essay?.notesContext ? (
                  <p>{def.essay.notesContext}</p>
                ) : null}
              </div>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-7 text-accent sm:text-base">
                {def.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {def.related && def.related.length ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground">
                Related terms
              </h2>
              <div className="mt-2 space-y-4 text-sm leading-7 text-accent sm:text-base">
                {def.essay?.relatedContext ? (
                  <p>{def.essay.relatedContext}</p>
                ) : null}
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {def.related.map((r) => (
                  <Link key={r} href={`/definitions/${r}`} className="group block">
                    <OverlayCard>
                      <OverlayCardPanel className="px-4 py-3">
                        <span className="text-sm font-medium text-foreground group-hover:text-primary">
                          {r}
                        </span>
                      </OverlayCardPanel>
                    </OverlayCard>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {def.faqs && def.faqs.length ? (
            <section>
              <h2 className="text-lg font-semibold text-foreground">FAQs</h2>
              <div className="mt-4 space-y-4 text-accent">
                {def.essay?.faqsContext ? (
                  <p className="text-sm leading-7 sm:text-base">
                    {def.essay.faqsContext}
                  </p>
                ) : null}
                {def.faqs.map((f, i) => (
                  <div key={i} className="space-y-2">
                    <p className="font-medium text-foreground">{f.q}</p>
                    <p className="text-sm leading-7 text-accent sm:text-base">
                      {f.a}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <aside className="mt-0 hidden lg:block lg:self-start">
          <div className="space-y-2 text-sm text-accent">
            <p className="text-xs uppercase tracking-wide">Published on</p>
            <p className="text-foreground">{publishedLabel}</p>
            <p className="mt-4 text-xs uppercase tracking-wide">Written by</p>
            <p className="text-foreground">{author}</p>
          </div>
        </aside>
      </div>
    </SkyPageShell>
  );
}
