import { createPageMetadata } from "@/lib/seo";
import { HelpArticleEditor } from "@/components/help/HelpArticleEditor";
import { resolveSearchParams } from "@/utils/search/params";
import { getHelpTreeData } from "../data";

export const revalidate = 0;

export const metadata = createPageMetadata({
  title: "New Article",
  description: "Write a help center article",
});

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ collection?: string | string[] }>;
};

export default async function NewHelpArticlePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await resolveSearchParams(searchParams)) ?? {};
  const tree = await getHelpTreeData(slug);
  const collections = tree?.collections ?? [];
  const requested = typeof sp.collection === "string" ? sp.collection : null;
  const initialCollectionId =
    collections.find((c) => c.id === requested)?.id ?? collections[0]?.id ?? null;

  return (
    <HelpArticleEditor
      workspaceSlug={slug}
      mode="create"
      collections={collections}
      initialCollectionId={initialCollectionId}
    />
  );
}
