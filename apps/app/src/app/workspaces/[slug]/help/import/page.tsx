import { redirect } from "next/navigation";
import { helpImportHref } from "@/components/help/import-url";
import { resolveSearchParams } from "@/utils/search/params";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

/** Drafting is a dialog on the help page now; old links (and GitHub round trips) land there. */
export default async function HelpImportPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = (await resolveSearchParams(searchParams)) ?? {};
  const kept: Record<string, string> = {};
  for (const key of ["site", "repo", "start", "onboarding", "github"]) {
    const value = sp[key];
    if (typeof value === "string") kept[key] = value.slice(0, 300);
  }
  redirect(helpImportHref(slug, kept));
}
