import { createPageMetadata } from "@/lib/seo";
import { HelpAnalytics } from "@/components/help/HelpAnalytics";
import { getHelpAnalyticsAccess } from "../data";

export const metadata = createPageMetadata({
  title: "Help Center Analytics",
  description: "Article views, helpfulness, and what visitors search for",
});

type Props = { params: Promise<{ slug: string }> };

export default async function HelpAnalyticsPage({ params }: Props) {
  const { slug } = await params;
  const access = await getHelpAnalyticsAccess(slug);
  return (
    <section className="-mx-4 bg-background pt-2 sm:-mx-8 lg:-mx-12 xl:-mx-16">
      <HelpAnalytics workspaceSlug={slug} initialAccess={access} />
    </section>
  );
}
