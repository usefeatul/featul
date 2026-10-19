import { notFound } from "next/navigation";
import { createPageMetadata } from "@/lib/seo";
import { HelpCenterList } from "@/components/help/HelpCenterList";
import { getHelpTreeData } from "./data";

export const revalidate = 0;

export const metadata = createPageMetadata({
  title: "Help Center",
  description: "Manage help center collections and articles",
});

type Props = { params: Promise<{ slug: string }> };

export default async function HelpCenterPage({ params }: Props) {
  const { slug } = await params;
  const tree = await getHelpTreeData(slug);
  if (!tree) return notFound();

  return (
    <section className="-mx-4 flex flex-1 flex-col bg-background pt-2 sm:-mx-8 lg:-mx-12 xl:-mx-16">
      <HelpCenterList workspaceSlug={slug} initialTree={tree} />
    </section>
  );
}
