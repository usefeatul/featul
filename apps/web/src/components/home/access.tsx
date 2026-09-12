import type { ComponentType } from "react";
import { MarketingContainer, marketingRailClass } from "@/components/layout/container";
import { SkyDashboardFrame } from "@/components/layout/sky-banner";
import { AccentBar } from "@featul/ui/components/cardElements";
import { BoardIcon } from "@featul/ui/icons/board";
import { DomainIcon } from "@featul/ui/icons/domain";
import { LinkIcon } from "@featul/ui/icons/link";
import { LockIcon } from "@featul/ui/icons/lock";
import { UserFocusIcon } from "@featul/ui/icons/userfocus";
import { VoteIcon } from "@featul/ui/icons/vote";

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
    icon: UserFocusIcon,
  },
];

export default function Access() {
  return (
    <section className="relative my-12 sm:my-16" data-component="Access">
      <MarketingContainer className="relative z-10">
        <div className={marketingRailClass}>
          <h2 className="font-heading text-2xl font-semibold text-foreground sm:text-3xl">
            What customers see on that page
          </h2>
          <div className="mt-3 flex items-start gap-2">
            <AccentBar width={8} />
            <p className="max-w-2xl text-sm leading-6 text-accent sm:text-base">
              The subdomain is a public feedback portal. Boards, votes, the
              roadmap, and the changelog live there. The dashboard your team
              uses stays separate.
            </p>
          </div>

          <SkyDashboardFrame className="mt-8">
            <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {portalItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.name}
                    className="group flex h-full flex-col bg-background px-5 py-5 sm:px-6 sm:py-6"
                  >
                    <Icon aria-hidden className="size-6" />
                    <h3 className="mt-4 text-sm font-medium text-foreground sm:text-base">
                      {item.name}
                    </h3>
                    <p className="mt-1.5 text-pretty text-sm leading-6 text-accent">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </SkyDashboardFrame>
        </div>
      </MarketingContainer>
    </section>
  );
}
