import Link from "next/link";
import type { JSONContent } from "@tiptap/core";
import type { HelpArticlePageData } from "@featul/api/help/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@featul/ui/components/avatar";
import { DitherGradient } from "@featul/ui/components/gradient";
import { raisedCardClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { ArrowLeft, ArrowRight } from "@/components/global/icons";
import RoleBadge from "@/components/global/RoleBadge";
import { getInitials } from "@/utils/user";
import { PoweredBy } from "../PoweredBy";
import { HelpArticleBody } from "./HelpArticleBody";
import { HelpAskButton } from "./HelpAskButton";
import { HelpFeedback } from "./HelpFeedback";
import { HelpSearch } from "./HelpSearch";
import { HelpBreadcrumbs, HelpMobileArticleNav } from "./HelpSidebar";
import { HelpNavTree } from "./HelpNavTree";
import { HelpToc } from "./HelpToc";
import { extractHeadings, formatHelpDate, helpArticleHref, helpCollectionHref, readingMinutes } from "./content";

export function HelpArticleView({ data, slug }: { data: HelpArticlePageData; slug: string }) {
  const { article, collection, siblings, tree, previous, next } = data;
  const content = article.content as JSONContent;
  const headings = extractHeadings(content);
  const author = article.author.name || "Team";
  const updated = formatHelpDate(article.updatedAt);

  return (
    <section className="flex flex-1 flex-col">
      <div className="grid flex-1 grid-cols-1 gap-10 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)_13rem]">
        <aside className="hidden md:block">
          <div data-help-rail className="sticky top-20 max-h-[calc(100dvh-6rem)] space-y-6 overflow-y-auto pb-6 [scrollbar-width:none]">
            <HelpSearch slug={slug} size="sm" />
            <HelpNavTree tree={tree} currentCollectionId={article.collectionId} activeArticleId={article.id} />
          </div>
        </aside>

        <article className="min-w-0 max-w-[42rem]">
          <HelpBreadcrumbs
            items={[
              { label: "Help", href: "/help" },
              ...(collection ? [{ label: collection.name, href: helpCollectionHref(collection.slug) }] : []),
              { label: article.title },
            ]}
          />
          <h1 className="mt-5 text-[1.75rem] font-semibold leading-tight tracking-tight text-foreground sm:mt-6 sm:text-[2.125rem]">
            {article.title}
          </h1>
          {article.summary ? (
            <p className="mt-3 text-base leading-relaxed text-muted-foreground sm:text-lg">{article.summary}</p>
          ) : null}
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-muted-foreground">
            <span className="inline-flex items-center gap-2">
              <Avatar className="relative size-6 overflow-visible">
                <AvatarImage src={article.author.image || undefined} alt={author} />
                <AvatarFallback className="bg-muted text-[9px]">{getInitials(author)}</AvatarFallback>
                <RoleBadge
                  role={article.author.role}
                  isOwner={article.author.isOwner}
                  isFeatul={article.author.isFeatul}
                />
              </Avatar>
              <span className="font-medium text-foreground">{author}</span>
            </span>
            {updated ? <span>Updated {updated}</span> : null}
            <span>{readingMinutes(content)} min read</span>
          </div>

          <HelpMobileArticleNav
            headings={headings}
            collection={collection}
            siblings={siblings}
            activeArticleId={article.id}
          />

          <div className="mb-8 mt-6 border-t border-border/60 dark:border-white/[0.07]" />
          <HelpArticleBody content={content} headings={headings} />

          <div className="mt-12">
            <HelpFeedback slug={slug} articleId={article.id} />
          </div>

          {previous || next ? (
            <nav aria-label="More in this collection" className="mt-8 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              {previous ? (
                <Link
                  href={helpArticleHref(previous.slug)}
                  className="group"
                >
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ArrowLeft className="size-3.5" /> Previous
                  </span>
                  <span className="mt-1 block truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {previous.title}
                  </span>
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={helpArticleHref(next.slug)}
                  className="group text-right sm:col-start-2"
                >
                  <span className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground">
                    Next <ArrowRight className="size-3.5" />
                  </span>
                  <span className="mt-1 block truncate text-sm font-medium text-foreground group-hover:text-primary">
                    {next.title}
                  </span>
                </Link>
              ) : null}
            </nav>
          ) : null}

          <div className="mt-10 lg:hidden">
            <StillStuck />
          </div>
        </article>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-10">
            <HelpToc headings={headings} />
            <StillStuck />
          </div>
        </aside>
      </div>
      <PoweredBy className="mt-auto pt-12" />
    </section>
  );
}

function StillStuck() {
  return (
    <div className={cn(raisedCardClass, "relative isolate overflow-hidden p-4")}>
      {/* Same corner dither as the help home topic cards. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{ maskImage: "radial-gradient(ellipse 60% 55% at 100% 0%, black 0%, rgba(0,0,0,0.35) 45%, transparent 75%)" }}
      >
        <DitherGradient to="primary" direction="down" cell={3} opacity={0.35} />
      </div>
      <p className="text-sm font-semibold text-foreground">Still stuck?</p>
      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
        Post it on the board. The team answers there.
      </p>
      <HelpAskButton className="mt-4 h-8 w-full justify-between text-[13px]" />
    </div>
  );
}
