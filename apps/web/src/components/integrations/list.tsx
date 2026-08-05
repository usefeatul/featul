import Link from "next/link";
import type { IntegrationEntry } from "@/lib/data/programmatic/matrix";
import { ChevronRightIcon } from "@featul/ui/icons/chevron-right";
import {
  COMING_SOON_INTEGRATION_SLUGS,
  getIntegrationIcon,
} from "./icons";

export default function IntegrationsList({
  items,
}: {
  items: IntegrationEntry[];
}) {
  return (
    <div className="divide-y divide-border/70">
      {items.map((integration) => {
        const Icon = getIntegrationIcon(integration.slug);
        const isComingSoon = COMING_SOON_INTEGRATION_SLUGS.has(integration.slug);

        return (
          <Link
            key={integration.slug}
            href={`/integrations/${integration.slug}`}
            className="group flex items-center gap-3 py-3 transition-colors hover:bg-muted/20 focus-visible:bg-muted/25 focus-visible:outline-none sm:gap-4 sm:py-4"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-background">
              <Icon className="size-5" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-foreground sm:text-base">
                  {integration.name}
                </p>
                {isComingSoon ? (
                  <span className="text-[11px] font-medium text-accent">
                    Coming soon
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 line-clamp-1 text-xs text-accent">
                {integration.description}
              </p>
            </div>
            <ChevronRightIcon
              className="text-accent transition-colors group-hover:text-foreground"
              size={14}
            />
          </Link>
        );
      })}
    </div>
  );
}
