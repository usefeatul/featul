import Link from "next/link";
import { alternatives as defaultAlternatives, type Alternative } from "@/config/alternatives";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card";

export default function AlternativesList({ items = defaultAlternatives }: { items?: Alternative[] }) {
  return (
    <div className="space-y-3">
      {items.map((alt) => (
        <Link
          key={alt.slug}
          href={`/alternatives/${alt.slug}`}
          className="group block"
        >
          <OverlayCard>
            <OverlayCardPanel className="flex items-center gap-3 px-3 py-3 sm:px-4">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground sm:text-base">
                  {alt.name} alternatives
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
            </OverlayCardPanel>
          </OverlayCard>
        </Link>
      ))}
    </div>
  );
}
