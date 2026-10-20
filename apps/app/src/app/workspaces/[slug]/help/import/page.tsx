import { createPageMetadata } from "@/lib/seo";
import { HelpImport } from "@/components/help/HelpImport";
import { resolveSearchParams } from "@/utils/search/params";

export const metadata = createPageMetadata({
  title: "Draft Help Center",
  description: "Draft help center articles from your website or GitHub repository",
});

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ site?: string | string[]; repo?: string | string[]; start?: string | string[]; onboarding?: string | string[]; welcome?: string | string[] }>;
};

const one = (v: string | string[] | undefined) => (typeof v === "string" ? v.slice(0, 300) : undefined);

export default async function HelpImportPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await resolveSearchParams(searchParams)) ?? {};
  return (
    <section className="-mx-4 flex flex-1 flex-col bg-background pt-6 sm:-mx-8 lg:-mx-12 xl:-mx-16">
      <HelpImport
        workspaceSlug={slug}
        initialSite={one(sp.site)}
        initialRepo={one(sp.repo)}
        autoStart={one(sp.start) === "1"}
        onboarding={one(sp.onboarding) === "1"}
        welcome={one(sp.welcome) === "1"}
      />
    </section>
  );
}
