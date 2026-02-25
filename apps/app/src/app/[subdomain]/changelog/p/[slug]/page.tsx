import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { JSONContent } from "@tiptap/core";

import SubdomainChangelogDetail from "@/components/subdomain/changelog-detail/SubdomainChangelogDetail";
import { createPageMetadata } from "@/lib/seo";
import { client } from "@featul/api/client";
import type { Role } from "@/types/team";

export const revalidate = 60;

type Props = { params: Promise<{ subdomain: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { subdomain, slug: entrySlug } = await params;
  const res = await client.changelog.entriesGet.$get({
    slug: subdomain,
    entrySlug,
  });
  const d = await res.json();
  const entry = (
    d as { entry?: { title?: string; summary?: string; coverImage?: string } }
  )?.entry;

  if (!entry) {
    return createPageMetadata({
      title: "Changelog Entry Not Found",
      description: "The requested changelog entry could not be found.",
    });
  }

  return createPageMetadata({
    title: entry.title || "Changelog Entry",
    description: entry.summary || "Changelog entry",
    image: entry.coverImage,
  });
}

export default async function ChangelogEntryPage({ params }: Props) {
  const { subdomain, slug: entrySlug } = await params;

  const res = await client.changelog.entriesGet.$get({
    slug: subdomain,
    entrySlug,
  });
  const d = await res.json();
  const rawEntry = (d as { entry?: Record<string, unknown> })?.entry;

  if (!rawEntry) {
    notFound();
  }

  const rawAuthor = rawEntry.author as
    | {
        name?: string | null;
        image?: string | null;
        role?: string | null;
        isOwner?: boolean;
      }
    | undefined;
  const content =
    rawEntry.content && typeof rawEntry.content === "object"
      ? (rawEntry.content as JSONContent)
      : null;

  const entry = {
    id: rawEntry.id as string,
    title: rawEntry.title as string,
    slug: rawEntry.slug as string,
    content,
    summary: rawEntry.summary as string | null,
    coverImage: rawEntry.coverImage as string | null,
    publishedAt: rawEntry.publishedAt as string | null,
    author: rawAuthor
      ? {
          name: rawAuthor.name,
          image: rawAuthor.image,
          role: rawAuthor.role as Role | null,
          isOwner: rawAuthor.isOwner,
        }
      : undefined,
    tags: rawEntry.tags as Array<{ id: string; name: string }> | undefined,
  };

  return (
    <SubdomainChangelogDetail
      entry={entry}
      subdomain={subdomain}
      backLink="/changelog"
    />
  );
}
