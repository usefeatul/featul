import type { HelpCollectionPageData } from "@featul/api/help/queries";
import { PoweredBy } from "../PoweredBy";
import { HelpAskBanner, NumberedArticles } from "./HelpHome";
import { HelpSearch } from "./HelpSearch";
import { HelpBreadcrumbs, HelpCollectionChips, HelpCollectionTile } from "./HelpSidebar";
import { HelpNavTree } from "./HelpNavTree";

export function HelpCollectionView({ data, slug }: { data: HelpCollectionPageData; slug: string }) {
  const { collection, articles, tree } = data;
  return (
    <section className="flex flex-1 flex-col">
      <div className="grid flex-1 grid-cols-1 gap-10 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[14rem_minmax(0,1fr)]">
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

          <HelpAskBanner className="mt-10" />
        </div>
      </div>
      <PoweredBy className="mt-auto pt-12" />
    </section>
  );
}
