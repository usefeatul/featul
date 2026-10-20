import { createPageMetadata } from "@/lib/seo";
import { HelpAnalytics } from "@/components/help/HelpAnalytics";

export const metadata = createPageMetadata({
  title: "Help Center Analytics",
  description: "Article views, helpfulness, and what visitors search for",
});

type Props = { params: Promise<{ slug: string }> };

export default async function HelpAnalyticsPage({ params }: Props) {
  const { slug } = await params;
  return (
    <section className="-mx-4 flex flex-1 flex-col bg-background pt-2 sm:-mx-8 lg:-mx-12 xl:-mx-16">
      <HelpAnalytics workspaceSlug={slug} />
    </section>
  );
}
