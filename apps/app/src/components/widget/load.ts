import { extractTextFromTiptap } from "@/types/changelog";
import type { WidgetChangelogEntry } from "./updates";
import { toShortPreview } from "./utils";

export function mapChangelogEntries(entries: unknown[]): WidgetChangelogEntry[] {
  return entries.map((raw) => {
    const entry = (raw && typeof raw === "object" ? raw : {}) as Record<string, any>;
    const summary =
      typeof entry.summary === "string" && entry.summary.trim() ? entry.summary.trim() : null;
    const fromContent = extractTextFromTiptap(entry.content);
    const rawPreview =
      (typeof entry.preview === "string" && entry.preview.trim() ? entry.preview.trim() : null) ||
      summary ||
      (fromContent ? fromContent.trim() : null);
    const preview = rawPreview ? toShortPreview(rawPreview, 3) : null;
    const authorName =
      (typeof entry.authorName === "string" && entry.authorName.trim()
        ? entry.authorName.trim()
        : null) ||
      (typeof entry.author?.name === "string" && entry.author.name.trim()
        ? entry.author.name.trim()
        : null);
    const authorImage =
      (typeof entry.authorImage === "string" && entry.authorImage.trim()
        ? entry.authorImage.trim()
        : null) ||
      (typeof entry.author?.image === "string" && entry.author.image.trim()
        ? entry.author.image.trim()
        : null);
    const authorIsOwner = Boolean(entry.authorIsOwner ?? entry.author?.isOwner);
    const authorRole =
      (typeof entry.authorRole === "string" ? entry.authorRole : null) ||
      (typeof entry.author?.role === "string" ? entry.author.role : null);
    const authorRoleLabel =
      (typeof entry.authorRoleLabel === "string" && entry.authorRoleLabel.trim()
        ? entry.authorRoleLabel.trim()
        : null) ||
      (typeof entry.author?.roleLabel === "string" && entry.author.roleLabel.trim()
        ? entry.author.roleLabel.trim()
        : null) ||
      (authorIsOwner
        ? "Founder"
        : authorRole === "admin"
          ? "Admin"
          : authorRole === "member"
            ? "Member"
            : authorRole === "viewer"
              ? "Viewer"
              : null);
    const tags = Array.isArray(entry.tags)
      ? entry.tags
          .filter(
            (tag: any) =>
              tag &&
              typeof tag.id === "string" &&
              typeof tag.name === "string" &&
              tag.name.trim(),
          )
          .map((tag: any) => ({
            id: String(tag.id),
            name: String(tag.name),
            color: typeof tag.color === "string" ? tag.color : null,
          }))
      : [];

    return {
      id: String(entry.id || ""),
      title: String(entry.title || ""),
      slug: typeof entry.slug === "string" ? entry.slug : undefined,
      summary,
      preview,
      content: entry.content ?? null,
      coverImage:
        typeof entry.coverImage === "string" && entry.coverImage.trim()
          ? entry.coverImage.trim()
          : null,
      publishedAt:
        entry.publishedAt instanceof Date
          ? entry.publishedAt.toISOString()
          : typeof entry.publishedAt === "string"
            ? entry.publishedAt
            : null,
      tags,
      authorName,
      authorImage,
      authorRoleLabel,
    } satisfies WidgetChangelogEntry;
  });
}
