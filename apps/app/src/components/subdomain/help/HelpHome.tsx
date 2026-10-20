import Link from "next/link";
import type { HelpArticleLink, HelpHomeData } from "@featul/api/help/queries";
import { DitherGradient } from "@featul/ui/components/gradient";
import { raisedCardClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { ArrowRight } from "@/components/global/icons";
import { PoweredBy } from "../PoweredBy";
import { HelpAskButton } from "./HelpAskButton";
import { HelpSearch } from "./HelpSearch";
import { HelpCollectionTile } from "./HelpSidebar";
import { helpArticleHref, helpCollectionHref } from "./content";

const rule = "border-t border-border/70 dark:border-white/[0.08]";
const PREVIEW_COUNT = 3;
/** Past this many collections, article previews turn the grid into a wall of links. */
const RICH_TOPIC_LIMIT = 4;

/**
 * Help center landing. Cards are kept for the two things worth framing (topics and the
 * board call to action); the hero and loose articles stay open so the page has rhythm.
 */
export function HelpHome({ data, slug }: { data: HelpHomeData; slug: string }) {
  const count = data.collections.length;
  const compact = count > RICH_TOPIC_LIMIT;
  return (
    <section className="flex flex-1 flex-col gap-14 sm:gap-16">
      <HelpHero
        name={data.workspace.name}
        slug={slug}
        askAi={data.workspace.askAi}
        popular={data.popular.slice(0, 3)}
      />

      {count > 0 ? (
        <div>
          <SectionHeading title="Browse by topic" hint={compact ? `${count} topics` : undefined} />
          <ul className={cn("grid grid-cols-1 sm:grid-cols-2", compact ? "gap-3" : "gap-4", count >= 3 && "lg:grid-cols-3")}>
            {data.collections.map((c) => (
              <li key={c.id} className="flex">
                {compact ? <CompactTopicCard collection={c} /> : <TopicCard collection={c} />}
              </li>
            ))}
          </ul>
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
  popular,
}: {
  name: string;
  slug: string;
  askAi: boolean;
  popular: HelpArticleLink[];
}) {
  return (
    // z-10: the search results must open over the topic cards that follow.
    <header className="relative isolate z-10 pt-8 sm:pt-16">
      {/* Brand dither glows down from the header and fades out before the search. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-8 -z-10 h-[26rem] sm:-top-10"
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
        {popular.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <span className="mr-1 text-xs text-muted-foreground">Popular:</span>
            {popular.map((a) => (
              <Link
                key={a.id}
                href={helpArticleHref(a.slug)}
                className="max-w-56 truncate rounded-full border border-border/80 bg-background/70 px-3 py-1.5 text-xs sm:px-2.5 sm:py-1 font-medium text-foreground/80 backdrop-blur-sm transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/[0.03]"
              >
                {a.title}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  );
}

function TopicCard({ collection: c }: { collection: HelpHomeData["collections"][number] }) {
  const href = helpCollectionHref(c.slug);
  const preview = c.articles.slice(0, PREVIEW_COUNT);
  const more = c.articleCount - preview.length;
  return (
    <article className={cn(raisedCardClass, "group/topic relative isolate flex w-full flex-col overflow-hidden p-5")}>
      {/* Corner dither ties each card to the brand without filling it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70 transition-opacity group-hover/topic:opacity-100"
        style={{ maskImage: "radial-gradient(ellipse 60% 55% at 100% 0%, black 0%, rgba(0,0,0,0.35) 45%, transparent 75%)" }}
      >
        <DitherGradient to="primary" direction="down" cell={3} opacity={0.35} />
      </div>

      <Link href={href} className="flex items-start gap-3.5 focus-visible:outline-none">
        <HelpCollectionTile icon={c.icon} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold text-foreground transition-colors hover:text-primary">
            {c.name}
          </span>
          <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
            {c.articleCount} {c.articleCount === 1 ? "article" : "articles"}
          </span>
        </span>
      </Link>
      {c.description ? (
        <p className="mt-3 line-clamp-2 text-sm leading-5 text-muted-foreground">{c.description}</p>
      ) : null}

      <ul className={cn(rule, "mt-4 flex-1 pt-2")}>
        {preview.map((a) => (
          <li key={a.id}>
            <Link
              href={helpArticleHref(a.slug)}
              className="group -mx-2 flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground/85 transition-colors hover:bg-muted/70 hover:text-foreground dark:hover:bg-white/[0.04]"
            >
              <span className="min-w-0 flex-1 truncate">{a.title}</span>
              <ArrowRight className="size-3.5 shrink-0 text-muted-foreground/50 transition-[transform,color] group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          </li>
        ))}
      </ul>

      {more > 0 ? (
        <Link href={href} className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
          View all {c.articleCount} articles <ArrowRight className="size-3" />
        </Link>
      ) : null}
    </article>
  );
}

/** Whole-card link for large help centers: no previews, dither only on hover. */
function CompactTopicCard({ collection: c }: { collection: HelpHomeData["collections"][number] }) {
  return (
    <Link
      href={helpCollectionHref(c.slug)}
      className={cn(
        raisedCardClass,
        "group/topic relative isolate flex w-full items-start gap-3.5 overflow-hidden p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover/topic:opacity-100"
        style={{ maskImage: "radial-gradient(ellipse 55% 80% at 100% 0%, black 0%, rgba(0,0,0,0.3) 45%, transparent 75%)" }}
      >
        <DitherGradient to="primary" direction="down" cell={3} opacity={0.35} />
      </div>
      <HelpCollectionTile icon={c.icon} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="truncate text-[15px] font-semibold text-foreground transition-colors group-hover/topic:text-primary">
            {c.name}
          </span>
          <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{c.articleCount}</span>
        </span>
        <span className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">
          {c.description || c.articles.slice(0, 3).map((a) => a.title).join(" · ")}
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

/** Ruled, numbered rows that flow into two columns on wide screens. */
export function NumberedArticles({
  articles,
  className,
}: {
  articles: Array<HelpArticleLink & { collectionName?: string | null }>;
  className?: string;
}) {
  return (
    <ol className={cn("grid grid-cols-1 gap-x-10 lg:grid-cols-2", className)}>
      {articles.map((a, i) => (
        <li key={a.id} className={cn(rule, "min-w-0")}>
          <Link
            href={helpArticleHref(a.slug)}
            className="group flex items-baseline gap-4 py-4 focus-visible:outline-none"
          >
            <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground/70 transition-colors group-hover:text-primary">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="line-clamp-2 text-[15px] font-medium text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary sm:line-clamp-1">
                {a.title}
              </span>
              {a.summary ? (
                <span className="mt-0.5 line-clamp-2 text-sm text-muted-foreground sm:line-clamp-1">{a.summary}</span>
              ) : null}
            </span>
            {a.collectionName ? (
              <span className="hidden shrink-0 text-xs text-muted-foreground/80 sm:inline">{a.collectionName}</span>
            ) : null}
          </Link>
        </li>
      ))}
    </ol>
  );
}

/** Featured closing card: brand dither behind the copy, one button. */
export function HelpAskBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        raisedCardClass,
        "relative isolate flex flex-col gap-5 overflow-hidden px-6 py-7 sm:flex-row sm:items-center sm:justify-between sm:px-8",
        className,
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{ maskImage: "radial-gradient(ellipse 45% 120% at 100% 50%, black 0%, rgba(0,0,0,0.35) 50%, transparent 80%)" }}
      >
        <DitherGradient to="primary" direction="left" cell={4} opacity={0.4} />
      </div>
      <div className="max-w-md">
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Can&apos;t find what you need?</h2>
        <p className="mt-1 text-sm leading-5 text-muted-foreground">
          Ask on the board. The team answers there, and if others need it too, it becomes a feature.
        </p>
      </div>
      <HelpAskButton className="shrink-0 self-start sm:self-auto" />
    </div>
  );
}
