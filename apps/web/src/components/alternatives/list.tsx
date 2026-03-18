import Link from "next/link";
import { alternatives as defaultAlternatives, type Alternative } from "@/config/alternatives";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";

export default function AlternativesList({ items = defaultAlternatives }: { items?: Alternative[] }) {
  return (
    <div className="divide-y divide-border/70">
      {items.map((alt) => (
        <Link
          key={alt.slug}
          href={`/alternatives/${alt.slug}`}
          className="group flex items-center gap-3 py-3 transition-colors hover:bg-muted/20 focus-visible:bg-muted/25 focus-visible:outline-none sm:gap-4 sm:py-4"
        >
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-foreground sm:text-base">
              featul vs {alt.name}
            </p>
            {alt.summary ? (
              <p className="text-accent mt-0.5 line-clamp-1 text-xs">
                {alt.summary}
              </p>
            ) : null}
          </div>
          <ChevronRightIcon
            className="text-accent transition-colors group-hover:text-foreground"
            size={14}
          />
        </Link>
      ))}
    </div>
  );
}
