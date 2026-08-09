import Link from "next/link";
import type { UseCaseItem } from "@/types/scenarios";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";

export default function UseCasesList({ items }: { items: UseCaseItem[] }) {
  return (
    <div className="divide-y divide-border/70">
      {items.map((useCase) => (
        <Link
          key={useCase.slug}
          href={`/use-cases/${useCase.slug}`}
          className="group flex items-center gap-3 py-3 transition-colors hover:bg-muted/20 focus-visible:bg-muted/25 focus-visible:outline-none sm:gap-4 sm:py-4"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium text-foreground sm:text-base">
                {useCase.cardTitle ?? useCase.name}
              </p>
              <span className="text-[11px] font-medium text-accent">
                {useCase.badge}
              </span>
            </div>
            <p className="mt-0.5 line-clamp-1 text-xs text-accent">
              {useCase.cardDescription ?? useCase.description}
            </p>
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
