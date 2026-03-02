import Link from "next/link";
import { alternatives as defaultAlternatives, type Alternative } from "@/config/alternatives";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";

export default function AlternativesList({ items = defaultAlternatives }: { items?: Alternative[] }) {
  return (
    <div className="mt-10 border-t border-border/70">
      {items.map((alt) => (
        <Link
          key={alt.slug}
          href={`/alternatives/${alt.slug}`}
          className="group flex items-center justify-between border-b border-border/70 py-4 transition-colors hover:text-primary sm:py-5"
        >
          <span className="text-sm font-medium text-foreground sm:text-base">
            featul vs {alt.name}
          </span>
          <ChevronRightIcon
            className="text-muted-foreground transition-colors group-hover:text-foreground"
            size={16}
          />
        </Link>
      ))}
    </div>
  );
}
