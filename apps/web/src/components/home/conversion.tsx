import {
  BoardIcon,
  RoadmapIcon,
  ChangelogIcon,
} from "@/components/global/icons";
import {
  MarketingContainer,
  MarketingRail,
} from "@/components/layout/container";

const steps = [
  {
    number: "01",
    icon: BoardIcon,
    label: "Listen",
    title: "Bring the good ideas together.",
    body: "Give customers one place to share requests and vote. Spend less time chasing feedback across chats and spreadsheets.",
  },
  {
    number: "02",
    icon: RoadmapIcon,
    label: "Decide",
    title: "Know what deserves your time.",
    body: "See which requests have momentum, choose what comes next, and share a roadmap that keeps everyone in the loop.",
  },
  {
    number: "03",
    icon: ChangelogIcon,
    label: "Deliver",
    title: "Turn a request into a reason to stay.",
    body: "Publish an update when you ship. Help customers discover what’s new and see how their feedback shaped your product.",
  },
];

export function ConversionHero() {
  return (
    <section className="py-10 sm:py-16" data-component="ConversionHero">
      <MarketingContainer>
        <MarketingRail>
          <div className="max-w-2xl text-left">
            <h2 className="font-heading text-balance text-2xl font-semibold text-foreground sm:text-3xl">
              A better product starts with a closer conversation.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-accent sm:text-base">
              Make your customers part of what comes next. One connected
              workflow, from their first idea to your latest release.
            </p>
          </div>
          <div className="mt-9 grid divide-y divide-border rounded-xl border border-border bg-card sm:mt-12 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {steps.map(({ number, icon: Icon, label, title, body }) => (
              <article key={number} className="p-6 sm:p-7">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                    <Icon aria-hidden className="size-4" />
                    {label}
                  </span>
                  <span className="font-mono text-xs text-accent/60">
                    {number}
                  </span>
                </div>
                <h3 className="mt-6 font-heading text-base font-medium text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-accent">{body}</p>
              </article>
            ))}
          </div>
        </MarketingRail>
      </MarketingContainer>
    </section>
  );
}
