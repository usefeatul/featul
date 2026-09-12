import Link from "next/link";
import type { IntegrationEntry } from "@/lib/data/programmatic/matrix";
import { SkyDashboardFrame } from "@/components/layout/sky-banner";
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
    <SkyDashboardFrame>
      <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
        {items.map((integration) => {
          const Icon = getIntegrationIcon(integration.slug);
          const isComingSoon = COMING_SOON_INTEGRATION_SLUGS.has(
            integration.slug,
          );

          return (
            <Link
              key={integration.slug}
              href={`/integrations/${integration.slug}`}
              className="group flex h-full flex-col bg-background px-5 py-5 transition-colors hover:bg-muted/40 sm:px-6 sm:py-6"
            >
              <Icon aria-hidden className="size-6" />
              <h3 className="mt-4 flex flex-wrap items-center gap-2 text-sm font-medium text-foreground sm:text-base">
                {integration.name}
                {isComingSoon ? (
                  <span className="text-[11px] font-medium text-accent">
                    Coming soon
                  </span>
                ) : null}
              </h3>
              <p className="mt-1.5 text-pretty text-sm leading-6 text-accent">
                {integration.description}
              </p>
            </Link>
          );
        })}
      </div>
    </SkyDashboardFrame>
  );
}
