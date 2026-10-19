import type { Metadata } from "next";
import { cache } from "react";
import { notFound } from "next/navigation";
import { db } from "@featul/db";
import { getHelpCollectionPageData } from "@featul/api/help/queries";
import { createHelpMetadata } from "@/lib/seo";
import { HelpCollectionView } from "@/components/subdomain/help/HelpCollectionView";
import { decodeSegment } from "../../segment";

export const revalidate = 30;

/** Shared by metadata and the page so one request runs the query once. */
const load = cache((subdomain: string, segment: string) =>
  getHelpCollectionPageData(db, subdomain, decodeSegment(segment)),
);

type Props = { params: Promise<{ subdomain: string; collection: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, collection } = await params;
  const data = await load(subdomain, collection);
  return createHelpMetadata(subdomain, {
    path: `/help/collections/${collection}`,
    label: data?.collection.name,
    description: data?.collection.description,
  });
}

export default async function HelpCollectionPage({ params }: Props) {
  const { subdomain, collection } = await params;
  const data = await load(subdomain, collection);
  if (!data) notFound();
  return <HelpCollectionView data={data} slug={subdomain} />;
}
