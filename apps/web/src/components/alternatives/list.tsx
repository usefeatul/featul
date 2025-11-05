import Link from "next/link";
import { alternatives as defaultAlternatives, type Alternative } from "@/config/alternatives";

export default function AlternativesList({ items = defaultAlternatives }: { items?: Alternative[] }) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((alt) => (
        <Link
          key={alt.slug}
          href={`/alternatives/${alt.slug}`}
          className="block rounded-lg border border-border p-4 hover:border-foreground transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{alt.name} vs Feedgot</span>
            <span className="text-xs text-muted-foreground">Compare</span>
          </div>
          {alt.summary && (
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{alt.summary}</p>
          )}
        </Link>
      ))}
    </div>
  );
}