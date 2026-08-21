import Link from "next/link";
import type { UseCaseItem } from "@/types/scenarios";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card";

export default function UseCasesList({ items }: { items: UseCaseItem[] }) {
  return (
    <div className="space-y-3">
      {items.map((useCase) => (
        <Link
          key={useCase.slug}
          href={`/use-cases/${useCase.slug}`}
          className="group block"
        >
          <OverlayCard>
            <OverlayCardPanel className="flex items-center gap-3 px-3 py-3 sm:px-4">
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
            </OverlayCardPanel>
          </OverlayCard>
        </Link>
      ))}
    </div>
  );
}
