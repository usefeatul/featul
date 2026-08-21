import type { ComponentType, SVGProps } from "react";
import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { AccentBar } from "@featul/ui/components/cardElements";
import { ShieldIcon } from "@featul/ui/icons/shield";
import { SetupIcon } from "@featul/ui/icons/setup";
import { FeatherIcon } from "@featul/ui/icons/feather";
import { ChartIcon } from "@featul/ui/icons/chart";
import { UsersIcon } from "@featul/ui/icons/users";
import { BookmarkIcon } from "@featul/ui/icons/bookmark";
import { OverlayCard, OverlayCardPanel } from "@/components/shared/overlay-card";

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { opacity?: number }>;

const POINT_ICONS: IconComponent[] = [
  ShieldIcon,
  SetupIcon,
  FeatherIcon,
  ChartIcon,
  UsersIcon,
  BookmarkIcon,
];

const DEFAULT_VICTORY_POINTS = [
  "EU hosting and GDPR-friendly defaults out of the box",
  "Unified feedback boards, public roadmap, and changelog",
  "Faster setup without enterprise implementation overhead",
];

function pointTitle(point: string): string {
  const cleaned = point.replace(/\.$/, "").trim();
  if (cleaned.length <= 56) return cleaned;
  return `${cleaned.slice(0, 53).trimEnd()}…`;
}

function pointBody(point: string, name: string): string {
  return `${point.replace(/\.$/, "")}. Compared with ${name}, this helps product teams move from raw feedback to shipped updates without juggling separate tools.`;
}

export default function WhyBetter({ alt }: { alt: Alternative }) {
  const victoryPoints = (alt.victoryPoints?.length ? alt.victoryPoints : DEFAULT_VICTORY_POINTS).slice(0, 4);
  const tradeoffs = (alt.tradeoffs?.length ? alt.tradeoffs : alt.pros ?? []).slice(0, 2);
  const tagline = alt.tagline?.toLowerCase() || "product feedback";

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="WhyBetter">
        <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
          <h2 className="text-foreground text-balance text-2xl sm:text-3xl lg:text-3xl font-semibold">
            Why teams choose Featul over {alt.name}
          </h2>

          <div className="mt-10 flex items-start gap-2">
            <AccentBar width={8} />
            <p className="text-accent text-sm sm:text-base">
              {alt.name} is known for {tagline}. Featul is a strong {alt.name}{" "}
              alternative when you want privacy-first defaults, a connected
              feedback-to-changelog workflow, and less setup overhead.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 items-start">
            {victoryPoints.map((point, index) => {
              const Icon = POINT_ICONS[index % POINT_ICONS.length]!;
              return (
                <div
                  key={point}
                  className={index % 2 === 1 ? "sm:relative sm:mt-8" : "sm:relative sm:mt-2"}
                >
                  <div className="flex items-start gap-3">
                    <Icon className="size-4 sm:size-5 text-primary" opacity={1} />
                    <h3 className="text-foreground text-base sm:text-lg font-medium">
                      {pointTitle(point)}
                    </h3>
                  </div>
                  <p className="text-accent mt-2 text-sm sm:text-base leading-7">
                    {pointBody(point, alt.name)}
                  </p>
                </div>
              );
            })}
          </div>

          {tradeoffs.length > 0 ? (
            <div className="mt-16 grid grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-6">
              <OverlayCard>
                <OverlayCardPanel className="flex h-full flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4">
                <h3 className="text-base font-medium text-foreground sm:text-lg">
                  When {alt.name} might still fit
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-accent sm:text-base">
                  {tradeoffs.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                </OverlayCardPanel>
              </OverlayCard>
              <OverlayCard>
                <OverlayCardPanel className="flex h-full flex-1 flex-col px-4 py-3 sm:px-5 sm:py-4">
                <h3 className="text-base font-medium text-foreground sm:text-lg">
                  Choose Featul when you want
                </h3>
                <ul className="mt-4 space-y-3 text-sm leading-7 text-accent sm:text-base">
                  {victoryPoints.slice(0, 3).map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                </OverlayCardPanel>
              </OverlayCard>
            </div>
          ) : null}
        </div>
      </section>
    </Container>
  );
}
