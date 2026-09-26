export const JUST_SHIPPED_DURATION = 7 * 24 * 60 * 60 * 1000;

type Release = {
  publishedAt?: string | Date | null;
  tags?: Array<{ name: string; color?: string | null }>;
};

export function releaseBadge(entry: Release, now: number) {
  const tag = entry.tags?.find((item) => item.name.trim());
  if (tag) return { name: tag.name.trim(), color: tag.color };
  if (!entry.publishedAt) return null;
  const publishedAt = new Date(entry.publishedAt).getTime();
  const age = now - publishedAt;
  return Number.isFinite(age) && age >= 0 && age < JUST_SHIPPED_DURATION
    ? { name: "Just shipped", color: null }
    : null;
}
