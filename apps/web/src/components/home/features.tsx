"use client";

import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { selectorSurfaceClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { BentoCard as FeatureCard } from "./bento";
import { PortalPreview, WidgetPreview } from "./previews";
import {
  StatusPreview,
  SimilarPreview,
  MergePreview,
  DiscussionPreview,
} from "./workflow";
import { homeFeatures } from "@/data/home";

const { cards } = homeFeatures;

export default function FeaturesSection() {
  return (
    <MarketingContainer>
      <section className="my-16 sm:my-20" data-component="Features">
        <div className={marketingRailClass}>
          <div className="max-w-2xl">
            <div>
              <h2 className="font-heading text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                {homeFeatures.title}
                <span className="block text-accent">
                  {homeFeatures.highlight}
                </span>
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-accent sm:text-base">
              {homeFeatures.description}
            </p>
          </div>

          <div
            className={cn(
              selectorSurfaceClass,
              // Raised like a button, toned for a large frame behind white cards.
              "mt-9 grid items-stretch gap-3 rounded-2xl from-[color-mix(in_oklab,var(--background),var(--foreground)_2%)] to-[color-mix(in_oklab,var(--background),var(--foreground)_4%)] p-2 supports-[corner-shape:squircle]:rounded-[calc(var(--radius)*4)] sm:mt-12 sm:p-3 md:grid-cols-2",
            )}
          >
            <FeatureCard
              tone="blue"
              title={cards.portal.title}
              body={cards.portal.body}
              href={cards.portal.href}
            >
              <PortalPreview />
            </FeatureCard>
            <FeatureCard
              tone="violet"
              title={cards.widget.title}
              body={cards.widget.body}
              href={cards.widget.href}
            >
              <WidgetPreview />
            </FeatureCard>
            <FeatureCard
              tone="peach"
              title={cards.status.title}
              body={cards.status.body}
            >
              <StatusPreview />
            </FeatureCard>

            <FeatureCard
              tone="mint"
              title={cards.similar.title}
              body={cards.similar.body}
            >
              <SimilarPreview />
            </FeatureCard>

            <FeatureCard
              tone="rose"
              title={cards.merge.title}
              body={cards.merge.body}
            >
              <MergePreview />
            </FeatureCard>

            <FeatureCard
              tone="teal"
              title={cards.discussion.title}
              body={cards.discussion.body}
            >
              <DiscussionPreview />
            </FeatureCard>
          </div>
        </div>
      </section>
    </MarketingContainer>
  );
}
