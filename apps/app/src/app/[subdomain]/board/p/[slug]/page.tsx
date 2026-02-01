import { notFound } from "next/navigation";
import type { Metadata } from "next";
import SubdomainRequestDetail from "@/components/subdomain/SubdomainRequestDetail";
import { createPostMetadata } from "@/lib/seo";
import { loadPublicBoardRequestDetailPageData } from "./data";

export const revalidate = 0;

type Props = {
  params: Promise<{ subdomain: string; slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug } = await params;
  return createPostMetadata(subdomain, slug, "/board/p");
}

export default async function PublicBoardRequestDetailPage({ params, searchParams }: Props) {
  const { subdomain, slug: postSlug } = await params;
  const sp = await searchParams;
  const data = await loadPublicBoardRequestDetailPageData({ subdomain, postSlug });
  if (!data) return notFound();

  const backLink = sp.from === "roadmap" ? "/roadmap" : data.backLink;

  return (
    <SubdomainRequestDetail
      post={data.post}
      workspaceSlug={data.workspaceSlug}
      initialComments={data.initialComments}
      initialCollapsedIds={data.initialCollapsedIds}
      backLink={backLink}
    />
  );
}
