import {
  BoardIcon,
  DomainIcon,
  LinkIcon,
  LockIcon,
  MemberIcon,
  VoteIcon,
} from "@/components/global/icons";
import type { ComponentType } from "react";
import { selectorSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { homeAccess } from "@/data/home";

type PortalItem = {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string; size?: number }>;
};

const portalIcons: PortalItem["icon"][] = [
  DomainIcon,
  LinkIcon,
  VoteIcon,
  BoardIcon,
  LockIcon,
  MemberIcon,
];

const portalItems: PortalItem[] = homeAccess.items.map((item, index) => ({
  ...item,
  icon: portalIcons[index]!,
}));

export default function Access() {
  return (
    <section
      className="relative mt-20 mb-12 sm:mt-28 sm:mb-16"
      data-component="Access"
    >
      <MarketingContainer className="relative z-10">
        <div className={marketingRailClass}>
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            {homeAccess.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-accent sm:text-base">
            {homeAccess.description}
          </p>

          <div
            className={cn(
              selectorSurfaceClass,
              "mt-9 overflow-hidden rounded-xl to-[color-mix(in_oklab,var(--card),var(--foreground)_3%)] supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*3.5)] sm:mt-12",
            )}
          >
            <div className="-mb-px -mr-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {portalItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.name}
                    className="flex h-full flex-col border-b border-r border-border p-6 sm:p-7"
                  >
                    <h3 className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                      <Icon aria-hidden className="size-4 shrink-0" />
                      {item.name}
                    </h3>
                    <p className="mt-6 text-pretty text-sm leading-6 text-accent">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MarketingContainer>
    </section>
  );
}
