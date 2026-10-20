import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { HelpArticleEditor } from "@/components/help/HelpArticleEditor";
import { getHelpArticleForEdit } from "../../data";

export const revalidate = 0;

export const metadata = createPageMetadata({
  title: "Edit Article",
  description: "Edit a help center article",
});

type Props = { params: Promise<{ slug: string; articleId: string }> };

export default async function EditHelpArticlePage({ params }: Props) {
  const { slug, articleId } = await params;
  const data = await getHelpArticleForEdit(slug, articleId);
  if (!data) return notFound();

  return (
    <HelpArticleEditor
      key={articleId}
      workspaceSlug={slug}
      mode="edit"
      articleId={articleId}
      initialData={data.article}
      collections={data.tree.collections}
    />
  );
}
