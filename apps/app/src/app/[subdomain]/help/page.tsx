import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@featul/db";
import { getHelpHomeData } from "@featul/api/help/queries";
import { createHelpMetadata } from "@/lib/seo";
import { HelpHome } from "@/components/subdomain/help/HelpHome";

export const revalidate = 30;

type Props = { params: Promise<{ subdomain: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain } = await params;
  return createHelpMetadata(subdomain, { path: "/help" });
}

export default async function HelpCenterPage({ params }: Props) {
  const { subdomain } = await params;
  const data = await getHelpHomeData(db, subdomain);
  if (!data) notFound();
  return <HelpHome data={data} slug={subdomain} />;
}
