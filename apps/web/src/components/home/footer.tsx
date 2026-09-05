import Link from "next/link";
import type { ComponentType } from "react";

import { Container } from "../global/container";
import {
  footerNavigationConfig,
  type FooterIconName,
  type FooterNavItem,
} from "@/config/footerNav";
import { StatusButton } from "@/components/home/status";
import FeatulLogoIcon from "@featul/ui/icons/featul-logo";
import { GitHubIcon } from "@featul/ui/icons/github";
import { FeedbackIcon } from "@featul/ui/icons/feedback";
import { BoardIcon } from "@featul/ui/icons/board";
import { VoteIcon } from "@featul/ui/icons/vote";
import { RoadmapIcon } from "@featul/ui/icons/roadmap";
import { ChangelogIcon } from "@featul/ui/icons/changelog";
import { WidgetIcon } from "@featul/ui/icons/widget";
import { DashboardIcon } from "@featul/ui/icons/dashboard";
import { DocIcon } from "@featul/ui/icons/doc";
import { BookIcon } from "@featul/ui/icons/book";
import { WrenchIcon } from "@featul/ui/icons/wrench";
import { MemberIcon } from "@featul/ui/icons/member";
import { CodeIcon } from "@featul/ui/icons/code";
import { BoxIcon } from "@featul/ui/icons/box";
import { CreditCardIcon } from "@featul/ui/icons/credit-card";
import { IntegrationIcon } from "@featul/ui/icons/integration";
import { ArticleIcon } from "@featul/ui/icons/article";
import { EnvelopeIcon } from "@featul/ui/icons/envelope";
import { ShieldStrokeIcon } from "@featul/ui/icons/shield-stroke";
import { getIntegrationIcon } from "@/components/integrations/icons";

type FeatulIcon = ComponentType<{
  className?: string;
  size?: number;
  opacity?: number;
}>;

const footerIcons: Record<FooterIconName, FeatulIcon> = {
  feedback: FeedbackIcon,
  requests: BoardIcon,
  voting: VoteIcon,
  roadmap: RoadmapIcon,
  changelog: ChangelogIcon,
  widget: WidgetIcon,
  dashboard: DashboardIcon,
  docs: DocIcon,
  definitions: BookIcon,
  tools: WrenchIcon,
  "use-cases": MemberIcon,
  "open-source": CodeIcon,
  start: BoxIcon,
  pricing: CreditCardIcon,
  integrations: IntegrationIcon,
  blog: ArticleIcon,
  demo: BoardIcon,
  contact: EnvelopeIcon,
  privacy: ShieldStrokeIcon,
  terms: ArticleIcon,
  gdpr: ShieldStrokeIcon,
};

const iconClassName =
  "size-4 shrink-0 text-accent transition-colors group-hover:text-primary";

function isExternalHref(item: FooterNavItem) {
  return (
    item.external === true ||
    item.href.startsWith("http://") ||
    item.href.startsWith("https://")
  );
}

function FooterLink({ item }: { item: FooterNavItem }) {
  const BrandIcon = item.integrationSlug
    ? getIntegrationIcon(item.integrationSlug)
    : null;
  const Icon = item.icon ? footerIcons[item.icon] : null;
  const external = isExternalHref(item);

  return (
    <Link
      href={item.href}
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
      className="group text-accent flex items-center gap-2.5 text-sm leading-5 transition-colors hover:text-primary"
    >
      {BrandIcon ? (
        <span className="inline-flex size-4 shrink-0 items-center justify-center overflow-hidden rounded-[3px]">
          <BrandIcon size={16} />
        </span>
      ) : Icon ? (
        <Icon aria-hidden className={iconClassName} size={16} />
      ) : null}
      <span>{item.name}</span>
    </Link>
  );
}

export default function FooterSection() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative overflow-hidden bg-background">
      <Container
        maxWidth="6xl"
        className="relative z-30 px-4 pb-10 pt-16 sm:px-10 md:pb-12 md:pt-20 lg:px-12 lg:pt-24 xl:px-14"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[minmax(220px,0.9fr)_minmax(0,3.1fr)] lg:items-start lg:gap-x-16 xl:gap-x-20">
            <div className="max-w-sm">
              <Link
                href="/"
                aria-label="Go home"
                className="inline-flex items-center gap-2 text-foreground hover:text-primary"
              >
                <FeatulLogoIcon />
                <span className="font-heading text-base font-semibold tracking-tight">
                  Featul
                </span>
              </Link>
              <p className="text-accent mt-4 text-sm leading-6">
                Customer feedback, roadmaps, and changelogs in one simple
                workspace. Built and hosted in the EU.
              </p>
              <div className="mt-5 flex items-center gap-4">
                {footerNavigationConfig.socials.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    {...(social.href.startsWith("http")
                      ? { target: "_blank", rel: "noopener noreferrer" }
                      : undefined)}
                    aria-label={social.name}
                    className="group text-accent transition-colors hover:text-primary"
                  >
                    {social.icon === "github" ? (
                      <GitHubIcon size={18} />
                    ) : (
                      <EnvelopeIcon size={18} />
                    )}
                  </Link>
                ))}
                <StatusButton
                  label="Operational"
                  className="h-auto rounded-none border-0 bg-transparent px-0 py-0 text-sm text-accent hover:bg-transparent hover:text-foreground"
                />
              </div>
            </div>

            <nav
              aria-label="Footer"
              className="grid grid-cols-2 gap-x-8 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-10 xl:gap-x-14"
            >
              {footerNavigationConfig.columns.map((column, columnIndex) => (
                <div key={columnIndex} className="flex flex-col gap-12">
                  {column.groups.map((group) => (
                    <div key={group.title} className="text-sm">
                      <span className="font-heading text-foreground block text-xs font-semibold uppercase tracking-wider">
                        {group.title}
                      </span>
                      <div className="mt-5 space-y-3">
                        {group.items.map((item) => (
                          <FooterLink
                            key={`${group.title}-${item.href}`}
                            item={item}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </nav>
          </div>

          <div className="mt-16 border-t border-border/60 pt-6">
            <p className="text-accent text-sm">© {year} Featul</p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
