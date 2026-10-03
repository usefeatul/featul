import {
  BoardIcon,
  DomainIcon,
  LinkIcon,
  LockIcon,
  MemberIcon,
  VoteIcon,
} from "@/components/global/icons";
import type { ComponentType } from "react";
import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { AccentBar } from "@featul/ui/components/cardElements";

type PortalItem = {
  name: string;
  description: string;
  icon: ComponentType<{ className?: string; size?: number }>;
};

const portalItems: PortalItem[] = [
  {
    name: "Your Featul subdomain",
    description:
      "Every workspace gets a public URL such as yourproduct.featul.com as soon as it exists. Share that link — it is the customer page, not the admin dashboard.",
    icon: DomainIcon,
  },
  {
    name: "Your own domain",
    description:
      "Point feedback.yourbrand.com at the same portal. Customers stay on your brand; both URLs serve the public site.",
    icon: LinkIcon,
  },
  {
    name: "Browse, vote, and submit",
    description:
      "People open the subdomain, pick a board, vote on ideas, and send a new request. No workspace login required.",
    icon: VoteIcon,
  },
  {
    name: "Roadmap and changelog",
    description:
      "The same public page can show what you plan to build and what already shipped, so the loop is visible without a second tool.",
    icon: BoardIcon,
  },
  {
    name: "Private boards stay off it",
    description:
      "Give a key account their own board. Private boards never appear in public navigation. Your team still sees the full picture.",
    icon: LockIcon,
  },
  {
    name: "Guest and anonymous",
    description:
      "Let people vote and submit without creating an account, and mask names when a public board should not show identities.",
    icon: MemberIcon,
  },
];

export default function Access() {
  return (
    <section
      className="relative mt-20 mb-12 sm:mt-28 sm:mb-16"
      data-component="Access"
    >
      <MarketingContainer className="relative z-10">
        <div className={marketingRailClass}>
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            Make it easy for customers to take part.
          </h2>
          <div className="mt-3 flex items-start gap-2">
            <AccentBar width={8} />
            <p className="max-w-2xl text-sm leading-6 text-accent sm:text-base">
              Meet customers on your own domain, welcome their ideas, and give
              them a clear view of what’s coming. You choose how open the
              conversation should be.
            </p>
          </div>

          <div className="mt-9 overflow-hidden rounded-xl border border-border bg-card/40 shadow-[0_1px_3px_rgba(0,0,0,0.03),0_10px_24px_-12px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.6)] sm:mt-12">
            <div className="-mb-px -mr-px grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {portalItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.name}
                    className="flex h-full flex-col border-b border-r border-border p-6 sm:p-7"
                  >
                    <h3 className="inline-flex items-center gap-2 text-sm font-medium text-primary">
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
