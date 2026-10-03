"use client";

import {
  MarketingContainer,
  marketingRailClass,
} from "@/components/layout/container";
import { BentoCard as FeatureCard } from "./bento";
import { PortalPreview, WidgetPreview } from "./previews";
import {
  StatusPreview,
  SimilarPreview,
  MergePreview,
  DiscussionPreview,
} from "./workflow";

export default function FeaturesSection() {
  return (
    <MarketingContainer>
      <section className="my-16 sm:my-20" data-component="Features">
        <div className={marketingRailClass}>
          <div className="max-w-2xl">
            <div>
              <h2 className="font-heading text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Everything you need for
                <span className="block text-accent">
                  a closer conversation.
                </span>
              </h2>
            </div>
            <p className="mt-4 text-sm leading-6 text-accent sm:text-base">
              Collect ideas where customers are, find what matters, and give
              your team a clear next step. All in one workspace.
            </p>
          </div>

          <div className="mt-9 grid items-stretch gap-3 rounded-2xl border border-border/70 bg-muted/35 p-2 shadow-[0_2px_8px_rgba(0,0,0,0.03)] sm:mt-12 sm:p-3 md:grid-cols-2">
            <FeatureCard
              tone="blue"
              title="A feedback space that feels like you."
              body="Give ideas, votes, and updates a home on your own domain or Featul address. No code needed—just share the link."
              href="/docs/getting-started"
            >
              <PortalPreview />
            </FeatureCard>
            <FeatureCard
              tone="violet"
              title="Catch ideas right inside your app."
              body="Add the widget with a small snippet. Customers can share feedback and follow updates without leaving your product."
              href="/docs/getting-started/widget"
            >
              <WidgetPreview />
            </FeatureCard>
            <FeatureCard
              tone="peach"
              title="You control what gets prioritized."
              body="Move requests from pending to planned, in progress, and shipped. Your team decides what happens next."
            >
              <StatusPreview />
            </FeatureCard>

            <FeatureCard
              tone="mint"
              title="Find the ideas already in motion."
              body="Show customers similar posts as they write, so they can join an existing conversation before starting a new one."
            >
              <SimilarPreview />
            </FeatureCard>

            <FeatureCard
              tone="rose"
              title="Keep one thread per idea."
              body="When people ask for the same thing in different words, merge the posts so votes and comments live in one place."
            >
              <MergePreview />
            </FeatureCard>

            <FeatureCard
              tone="teal"
              title="Keep the team thread private."
              body="Leave internal comments and mention teammates without showing that discussion on the public board."
            >
              <DiscussionPreview />
            </FeatureCard>
          </div>
        </div>
      </section>
    </MarketingContainer>
  );
}
