"use client";
import Link from "next/link";
import { ChevronLeft, ArrowUpRight } from "lucide-react";
import { FaqAccordion } from "@/components/shared/accordion";
import { SkyPageShell } from "@/components/layout/shell";
import {
  getDefinitionBySlug,
  getDefinitionContent,
} from "@/content/definitions";
import type { Definition } from "@/types/definitions";
import { findToolForDefinition } from "@/types/tools";

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
  const relatedTool = findToolForDefinition(def.slug);
  const relatedToolHref = relatedTool
    ? `/tools/categories/${relatedTool.categorySlug}/${relatedTool.tool.slug}`
    : null;
  return (
    <SkyPageShell
      dataComponent="DefinitionDetail"
      title={def.name}
      headerClassName="max-w-none mb-8 sm:mb-10"
      description={
        <div>
          <p>{def.short}</p>
          <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-accent">By</dt>
              <dd className="font-medium text-foreground">{author}</dd>
            </div>
            <div className="flex flex-wrap items-baseline gap-1.5">
              <dt className="text-accent">Published</dt>
              <dd className="text-accent">{publishedLabel}</dd>
            </div>
          </dl>
        </div>
      }
      meta={
        <Link
          href="/definitions"
          className="inline-flex items-center gap-1.5 rounded-sm text-sm text-accent transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ChevronLeft className="size-4" />
          All definitions
        </Link>
      }
    >
      <div className="w-full min-w-0 space-y-12 sm:space-y-16">
        <article
          aria-label={`${def.name} guide`}
          className="w-full min-w-0 space-y-9 sm:space-y-10"
        >
          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              Overview
            </h2>
            <div className="mt-3 space-y-4 text-sm leading-7 text-accent sm:text-base">
              {def.essay?.intro ? <p>{def.essay.intro}</p> : null}
              <p>{overview}</p>
            </div>
          </section>

          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              Definition
            </h2>
            <div className="mt-3 space-y-4 text-sm leading-7 text-accent sm:text-base">
              {def.essay?.analysis ? <p>{def.essay.analysis}</p> : null}
              <p>{full}</p>
            </div>
          </section>

          {def.formula ? (
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {def.formula.title}
              </h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-accent sm:text-base">
                <p>{def.formula.body}</p>
                {def.essay?.formulaContext ? (
                  <p>{def.essay.formulaContext}</p>
                ) : null}
              </div>
              {def.formula.code ? (
                <pre className="mt-5 whitespace-pre-wrap break-words rounded-md bg-muted/60 px-5 py-4 text-sm leading-6 text-foreground">
                  <code>{def.formula.code}</code>
                </pre>
              ) : null}
              {relatedToolHref ? (
                <p className="mt-4 text-sm leading-7 text-accent sm:text-base">
                  Use the{" "}
                  <Link
                    href={relatedToolHref}
                    className="font-medium text-primary hover:underline"
                  >
                    {relatedTool?.tool.name}
                  </Link>{" "}
                  to run this formula with your own numbers.
                </p>
              ) : null}
            </section>
          ) : null}

          {def.example ? (
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                {def.example.title}
              </h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-accent sm:text-base">
                <p>{def.example.body}</p>
                {def.essay?.exampleContext ? (
                  <p>{def.essay.exampleContext}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {def.pitfalls && def.pitfalls.length ? (
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                Common pitfalls
              </h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-accent sm:text-base">
                {def.essay?.pitfallsContext ? (
                  <p>{def.essay.pitfallsContext}</p>
                ) : null}
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-accent sm:text-base">
                {def.pitfalls.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {def.benchmarks ? (
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                Benchmarks
              </h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-accent sm:text-base">
                <p>{def.benchmarks}</p>
                {def.essay?.benchmarksContext ? (
                  <p>{def.essay.benchmarksContext}</p>
                ) : null}
              </div>
            </section>
          ) : null}

          {def.notes && def.notes.length ? (
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                Notes
              </h2>
              <div className="mt-3 space-y-4 text-sm leading-7 text-accent sm:text-base">
                {def.essay?.notesContext ? (
                  <p>{def.essay.notesContext}</p>
                ) : null}
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-accent sm:text-base">
                {def.notes.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </section>
          ) : null}

          {def.useCases && def.useCases.length ? (
            <section>
              <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                Use cases
              </h2>
              <div className="mt-4 space-y-5">
                {def.useCases.map((item) => (
                  <div key={item.title} className="space-y-2">
                    <h3 className="font-medium text-foreground">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-7 text-accent sm:text-base">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {def.sections && def.sections.length ? (
            <>
              {def.sections.map((section) => (
                <section key={section.title}>
                  <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-2 text-sm leading-7 text-accent sm:text-base">
                    {section.body}
                  </p>
                </section>
              ))}
            </>
          ) : null}
        </article>

        {def.related && def.related.length ? (
          <section>
            <h2 className="font-heading text-xl font-semibold tracking-tight text-foreground">
              Related terms
            </h2>
            <div className="mt-3 space-y-4 text-sm leading-7 text-accent sm:text-base">
              {def.essay?.relatedContext ? (
                <p>{def.essay.relatedContext}</p>
              ) : null}
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {def.related.map((r) => {
                const related = getDefinitionBySlug(r);
                return (
                  <Link
                    key={r}
                    href={`/definitions/${r}`}
                    className="group flex items-start justify-between gap-4 border-b border-border py-4 transition-colors hover:border-primary/40 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  >
                    <div>
                      <span className="font-heading text-base font-medium text-foreground group-hover:text-primary">
                        {related?.name ?? r}
                      </span>
                      {related?.short ? (
                        <p className="mt-1.5 text-sm leading-6 text-accent">
                          {related.short}
                        </p>
                      ) : null}
                    </div>
                    <ArrowUpRight
                      className="mt-1 size-4 shrink-0 text-accent transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none"
                      aria-hidden
                    />
                  </Link>
                );
              })}
            </div>
          </section>
        ) : null}

        {def.faqs && def.faqs.length ? (
          <section
            aria-label="Frequently asked questions"
            data-component="DefinitionFAQ"
          >
            <FaqAccordion
              title="Questions & Answers"
              description={def.essay?.faqsContext}
              items={def.faqs.map((faq, index) => ({
                id: `${def.slug}-faq-${index}`,
                question: faq.q,
                answer: faq.a,
              }))}
            />
          </section>
        ) : null}
      </div>
    </SkyPageShell>
  );
}
