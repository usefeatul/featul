import type { Metadata } from "next"
import { createPageMetadata } from "@/lib/seo"

export const revalidate = 30

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return createPageMetadata({
    title: "Changelog",
    description: "Product updates and announcements",
    path: `/workspaces/${slug}/changelog`,
    indexable: false,
  })
}

export default async function ChangelogPage({ params }: Props) {
  await params
  return null
}
