import {
  BoardIcon,
  RoadmapIcon,
  ChangelogIcon,
} from "@/components/global/icons";
import {
  modalCardInnerClass,
  modalCardShellClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import {
  MarketingContainer,
  MarketingRail,
} from "@/components/layout/container";
import { DitherGradient } from "@/components/dither-kit/gradient";

const steps: {
  number: string;
  icon: typeof BoardIcon;
  iconColor: string;
  tone: [number, number, number];
  label: string;
  title: string;
  body: string;
}[] = [
  {
    number: "01",
    icon: BoardIcon,
    iconColor: "#4189e2",
    tone: [142, 198, 250],
    label: "Listen",
    title: "Bring the good ideas together.",
    body: "Give customers one place to share requests and vote. Spend less time chasing feedback across chats and spreadsheets.",
  },
  {
    number: "02",
    icon: RoadmapIcon,
    iconColor: "#3b95af",
    tone: [90, 192, 202],
    label: "Decide",
    title: "Know what deserves your time.",
    body: "See which requests have momentum, choose what comes next, and share a roadmap that keeps everyone in the loop.",
  },
  {
    number: "03",
    icon: ChangelogIcon,
    iconColor: "#837ec8",
    tone: [186, 166, 240],
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
          <div className="mt-9 grid gap-3 sm:mt-12 sm:grid-cols-3">
            {steps.map(({ number, icon: Icon, iconColor, tone, label, title, body }) => (
              <article
                key={number}
                className={cn(modalCardShellClass, "flex min-w-0 flex-col")}
              >
                <header className="flex items-center justify-between gap-3 px-2.5 py-1.5">
                  <span className="inline-flex items-center gap-2 text-sm font-medium leading-6 text-foreground">
                    <Icon aria-hidden className="size-4" style={{ color: iconColor }} />
                    {label}
                  </span>
                  <span className="font-mono text-xs text-accent/60">
                    {number}
                  </span>
                </header>
                <div
                  className={cn(
                    modalCardInnerClass,
                    "relative flex-1 overflow-hidden px-5 py-4",
                  )}
                >
                  <DitherGradient
                    from={tone}
                    direction="left"
                    cell={2}
                    opacity={0.35}
                    bloom="off"
                    className="[mask-image:radial-gradient(45%_70%_at_100%_0%,black,transparent)]"
                  />
                  <h3 className="relative font-heading text-base font-medium text-foreground">
                    {title}
                  </h3>
                  <p className="relative mt-2 text-sm leading-6 text-accent">
                    {body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </MarketingRail>
      </MarketingContainer>
    </section>
  );
}
