import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@featul/db";
import { getHelpArticlePageData } from "@featul/api/help/queries";
import { createHelpMetadata } from "@/lib/seo";
import { HelpArticleView } from "@/components/subdomain/help/HelpArticleView";
import { decodeSegment } from "../../segment";

export const revalidate = 30;

/** Shared by metadata and the page so one request runs the query once. */
const load = cache((subdomain: string, segment: string) =>
  getHelpArticlePageData(db, subdomain, decodeSegment(segment)),
);

type Props = { params: Promise<{ subdomain: string; article: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, article } = await params;
  const data = await load(subdomain, article);
  return createHelpMetadata(subdomain, {
    path: `/help/articles/${article}`,
    label: data?.article.title,
    description: data?.article.summary,
  });
}

export default async function HelpArticlePage({ params }: Props) {
  const { subdomain, article } = await params;
  const data = await load(subdomain, article);
  if (!data) notFound();
  return <HelpArticleView data={data} slug={subdomain} />;
}
