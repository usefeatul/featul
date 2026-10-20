import Link from "next/link";
import type { HelpCollectionPageData } from "@featul/api/help/queries";
import { PoweredBy } from "../PoweredBy";
import { HelpAskBanner, NumberedArticles } from "./HelpHome";
import { StillStuck } from "./HelpArticleView";
import { HelpSearch } from "./HelpSearch";
import { HelpCollectionTile } from "@/components/help/icons";
import { HelpBreadcrumbs, HelpCollectionChips } from "./HelpSidebar";
import { HelpNavTree } from "./HelpNavTree";
import { helpCollectionHref } from "./content";

export function HelpCollectionView({ data, slug }: { data: HelpCollectionPageData; slug: string }) {
  const { collection, articles, tree } = data;
  const index = tree.collections.findIndex((c) => c.id === collection.id);
  // The following topic, wrapping to the first so the last topic still points somewhere.
  const next =
    tree.collections.length > 1
      ? tree.collections[(index + 1) % tree.collections.length]
      : undefined;
  return (
    <section className="flex flex-1 flex-col">
      <div className="grid flex-1 grid-cols-1 gap-10 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)_13rem]">
        <aside className="hidden md:block">
          <div data-help-rail className="sticky top-20 max-h-[calc(100dvh-6rem)] space-y-6 overflow-y-auto pb-6 [scrollbar-width:none]">
            <HelpSearch slug={slug} size="sm" askAi={data.workspace.askAi} />
            <HelpNavTree tree={tree} currentCollectionId={collection.id} />
          </div>
        </aside>

        <div className="min-w-0 max-w-3xl">
          <HelpBreadcrumbs items={[{ label: "Help", href: "/help" }, { label: collection.name }]} />
          <header className="mt-6 flex items-start gap-4">
            <HelpCollectionTile icon={collection.icon} className="size-11" />
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{collection.name}</h1>
              {collection.description ? (
                <p className="mt-1.5 text-[15px] text-muted-foreground">{collection.description}</p>
              ) : null}
              <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                {collection.articleCount} {collection.articleCount === 1 ? "article" : "articles"}
              </p>
            </div>
          </header>

          <HelpSearch slug={slug} className="mt-6 md:hidden" size="sm" askAi={data.workspace.askAi} />
          <HelpCollectionChips collections={tree.collections} currentId={collection.id} className="mt-4" />

          <NumberedArticles articles={articles} className="mt-8 lg:grid-cols-1" />

          {/* Wide screens show the ask card in the right rail instead. */}
          <HelpAskBanner className="mt-10 lg:hidden" />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20 space-y-10">
            {next ? <UpNext collection={next} /> : null}
            <div>
              <StillStuck />
              <PoweredBy className="justify-start pt-4" />
            </div>
          </div>
        </aside>
      </div>
      <PoweredBy className="mt-auto pt-12 lg:hidden" />
    </section>
  );
}

/** Rail link to the following topic, styled like the page's own header. */
function UpNext({ collection: c }: { collection: HelpCollectionPageData["tree"]["collections"][number] }) {
  return (
    <div>
      <p className="mb-3 text-xs font-medium text-foreground">Up next</p>
      <Link href={helpCollectionHref(c.slug)} className="group flex items-start gap-3 focus-visible:outline-none">
        <HelpCollectionTile icon={c.icon} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium text-foreground transition-colors group-hover:text-primary group-focus-visible:text-primary">
            {c.name}
          </span>
          <span className="mt-0.5 block text-xs tabular-nums text-muted-foreground">
            {c.articleCount} {c.articleCount === 1 ? "article" : "articles"}
          </span>
        </span>
      </Link>
    </div>
  );
}
