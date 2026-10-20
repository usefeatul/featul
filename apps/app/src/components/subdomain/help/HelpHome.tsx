import Link from "next/link";
import type { HelpArticleLink, HelpHomeData } from "@featul/api/help/queries";
import { DitherGradient } from "@featul/ui/components/gradient";
import { modalCardInnerClass, modalCardShellClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { ArrowRight } from "@/components/global/icons";
import { PoweredBy } from "../PoweredBy";
import { HelpAskButton } from "./HelpAskButton";
import { HelpSearch } from "./HelpSearch";
import { HelpCollectionTile } from "@/components/help/icons";
import {
  settingsSectionClass,
  settingsSurfaceHeaderClass,
} from "@/components/settings/global/SectionCard";
import { helpArticleHref, helpCollectionHref } from "./content";

const rule = "border-t border-border/70 dark:border-white/[0.08]";

/**
 * Help center landing: an open hero (dither behind the title and search), a grid of small
 * settings-style topic tiles, then open numbered lists for popular and loose articles.
 */
export function HelpHome({ data, slug }: { data: HelpHomeData; slug: string }) {
  const count = data.collections.length;
  const popular = data.popular;
  return (
    <section className="flex flex-1 flex-col gap-12 pt-6 sm:gap-14 sm:pt-10">
      <HelpHero name={data.workspace.name} slug={slug} askAi={data.workspace.askAi} />

      {count > 0 ? (
        <div>
          <SectionHeading title="Browse by topic" hint={`${count} topics`} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {data.collections.map((c) => (
              <li key={c.id} className="flex">
                <TopicTile collection={c} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {popular.length > 0 ? (
        <div>
          <SectionHeading title="Popular articles" />
          <NumberedArticles articles={popular} />
        </div>
      ) : null}

      {data.uncategorized.length > 0 ? (
        <div>
          <SectionHeading title="More articles" />
          <NumberedArticles articles={data.uncategorized} />
        </div>
      ) : null}

      <div className="mt-auto">
        <HelpAskBanner />
        <PoweredBy className="pt-10" />
      </div>
    </section>
  );
}

function HelpHero({
  name,
  slug,
  askAi,
}: {
  name: string;
  slug: string;
  askAi: boolean;
}) {
  return (
    // z-10: the search results must open over the cards that follow.
    <header className="relative isolate z-10 pt-2 sm:pt-6">
      {/* Brand dither glows down from the header and fades out before the search. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-16 -z-10 h-[26rem] sm:-top-20"
        style={{ maskImage: "radial-gradient(ellipse 55% 75% at 50% 0%, black 0%, rgba(0,0,0,0.3) 45%, transparent 75%)" }}
      >
        <DitherGradient to="primary" direction="down" cell={4} opacity={0.28} />
      </div>
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-primary">Help center</p>
        <h1 className="mt-4 text-[2rem] font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl">
          How can we help?
        </h1>
        <p className="mt-4 text-[15px] text-muted-foreground">
          Guides and answers from the {name} team.
        </p>
        <HelpSearch slug={slug} className="mt-9" askAi={askAi} />
      </div>
    </header>
  );
}

/** Square settings-style tile per topic: icon tile, name, count; dither fades in on hover. */
function TopicTile({ collection: c }: { collection: HelpHomeData["collections"][number] }) {
  return (
    <Link
      href={helpCollectionHref(c.slug)}
      title={c.description ?? undefined}
      className={cn(
        modalCardShellClass,
        "group/topic flex w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <span className={cn(modalCardInnerClass, "relative isolate flex flex-1 flex-col p-4")}>
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/topic:opacity-100"
          style={{ maskImage: "radial-gradient(ellipse 70% 70% at 100% 0%, black 0%, rgba(0,0,0,0.3) 45%, transparent 75%)" }}
        >
          <DitherGradient to="primary" direction="down" cell={3} opacity={0.35} />
        </span>
        <HelpCollectionTile icon={c.icon} />
        <span className="mt-6 line-clamp-2 text-sm font-medium leading-5 text-foreground transition-colors group-hover/topic:text-primary">
          {c.name}
        </span>
        <span className="mt-1 text-xs tabular-nums text-muted-foreground">
          {c.articleCount} {c.articleCount === 1 ? "article" : "articles"}
        </span>
      </span>
    </Link>
  );
}

function SectionHeading({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="mb-4 flex items-baseline justify-between gap-3">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {hint ? <span className="text-xs tabular-nums text-muted-foreground">{hint}</span> : null}
    </div>
  );
}

/** Ruled, numbered rows that flow into two columns on wide screens: topic label, title, summary, hover arrow. */
export function NumberedArticles({
  articles,
  className,
}: {
  articles: Array<HelpArticleLink & { collectionName?: string | null }>;
  className?: string;
}) {
  // Keep the topic line's space on every row when any row has one, so the columns stay level.
  const labelled = articles.some((a) => a.collectionName);
  return (
    <ol className={cn("grid grid-cols-1 gap-x-12 lg:grid-cols-2", className)}>
      {articles.map((a, i) => (
        <li key={a.id} className={cn(rule, "min-w-0")}>
          <Link
            href={helpArticleHref(a.slug)}
            className="group flex items-start gap-4 py-4.5 focus-visible:outline-none"
          >
            <span
              className={cn(
                "w-5 shrink-0 text-xs leading-5 tabular-nums text-muted-foreground/60 transition-colors group-hover:text-primary",
                // Line the number up with the title, below the topic label when there is one.
                labelled ? "mt-[1.375rem]" : "mt-px",
              )}
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              {labelled ? (
                <span className="mb-1 block h-4 truncate text-[11px] font-medium uppercase leading-4 tracking-[0.08em] text-primary/80">
                  {a.collectionName}
                </span>
              ) : null}
              <span className="line-clamp-2 text-[15px] font-medium leading-6 text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary sm:line-clamp-1">
                {a.title}
              </span>
              {a.summary ? (
                <span className="mt-0.5 line-clamp-2 text-sm leading-5 text-muted-foreground sm:line-clamp-1">{a.summary}</span>
              ) : null}
            </span>
            <ArrowRight
              aria-hidden
              className={cn(
                "size-3.5 shrink-0 -translate-x-1 text-primary opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
                labelled ? "mt-[1.6875rem]" : "mt-[0.3125rem]",
              )}
            />
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Featured closing card: settings-card frame, brand dither behind the copy, one button. */
export function HelpAskBanner({ className }: { className?: string }) {
  return (
    <div className={cn(settingsSectionClass, className)}>
      <header className={settingsSurfaceHeaderClass}>
        <h2 className="text-sm font-medium leading-6 text-foreground">Can&apos;t find what you need?</h2>
      </header>
      <div
        className={cn(
          modalCardInnerClass,
          "relative isolate flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{ maskImage: "radial-gradient(ellipse 45% 120% at 100% 50%, black 0%, rgba(0,0,0,0.35) 50%, transparent 80%)" }}
        >
          <DitherGradient to="primary" direction="left" cell={4} opacity={0.4} />
        </div>
        <p className="max-w-md text-sm leading-5 text-muted-foreground">
          Ask on the board. The team answers there, and if others need it too, it becomes a feature.
        </p>
        <HelpAskButton className="shrink-0 self-start sm:self-auto" />
      </div>
    </div>
  );
}
