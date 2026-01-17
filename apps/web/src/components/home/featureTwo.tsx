"use client";
import { cn } from "@featul/ui/lib/utils";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@featul/ui/components/toggle-group";
import {
  Bold,
  Calendar1,
  Ellipsis,
  Italic,
  Strikethrough,
  Underline,
} from "lucide-react";
import { Button } from "@featul/ui/components/button";
import { Card } from "@featul/ui/components/card";
import { Container } from "../global/container";
import { ChartIcon } from "@featul/ui/icons/chart";
import { UsersIcon } from "@featul/ui/icons/users";
import { SetupIcon } from "@featul/ui/icons/setup";
import { AiIcon } from "@featul/ui/icons/ai";
import { CardAccent, CardTag, AccentBar } from "@featul/ui/components/cardElements";

export default function FeaturesSection() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section>
        <div className="bg-background py-16 sm:py-24">
          <div className="mx-auto w-full max-w-5xl px-1 sm:px-6">
            <div>
              <h2 className="text-foreground mt-4 text-2xl sm:text-3xl lg:text-3xl font-semibold">
                Personal AI, with you Anywhere
              </h2>
              <div className="mt-10 flex items-stretch gap-3">
                <AccentBar />
                <p className="text-accent text-sm sm:text-base">
                  Quick AI jean lives a single hotkey away - ready to quickly
                  appear as a floating window above your other apps. Get instant
                  assistance whether you’re browsing, coding, or writing
                  documents.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 lg:gap-6 md:grid-cols-2 mt-8">
              {/* Long top card (1) */}
              <Card className="relative p-4 sm:p-6 md:p-8 md:col-span-2">
                <CardTag />
                <div className="absolute left-3 top-3 z-10 space-y-1">
                  <AiIcon
                    className="size-4 sm:size-5 text-primary opacity-100"
                    opacity={1}
                    aria-hidden
                  />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">
                    Quick AI
                  </h3>
                  <CardAccent>Always ready with a single hotkey.</CardAccent>
                </div>
                <div className="flex flex-col gap-4 sm:gap-6 md:flex-row md:items-center">
                  <div className="flex-1 mt-12 sm:mt-16 text-left">
                    <p className="text-muted-foreground mt-3 text-base sm:text-lg sm:max-w-[50ch]">
                      Summon a focused assistant with a single hotkey. Draft
                      content, schedule meetings, and move work forward without
                      context switching.
                    </p>
                    <div className="mt-5 flex gap-3">
                      <Button size="sm" className="rounded-md">
                        Open Quick AI
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-md"
                      >
                        Learn more
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="mx-auto max-w-[18rem] sm:max-w-sm md:max-w-md">
                      <ScheduleIllustation className="w-full" variant="mixed" />
                    </div>
                  </div>
                </div>
              </Card>

              {/* Row 2 (2 items) */}
              <Card className="relative p-4 sm:p-6">
                <CardTag />
                <div className="absolute left-3 top-3 z-10 space-y-1">
                  <ChartIcon
                    className="size-4 sm:size-5 text-primary opacity-100"
                    opacity={1}
                    aria-hidden
                  />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">
                    Marketing Campaigns
                  </h3>
                  <CardAccent>Plan, track, and optimize campaigns.</CardAccent>
                </div>
                <div className="flex aspect-video items-center justify-center">
                  <CodeIllustration className="w-full" />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mt-4 text-balance text-base sm:text-lg sm:max-w-[50ch] mx-auto">
                    Plan and execute campaigns with briefs, assets, and
                    timelines in one view.
                  </p>
                </div>
              </Card>
              <Card className="relative p-4 sm:p-6">
                <CardTag />
                <div className="absolute left-3 top-3 z-10 space-y-1">
                  <UsersIcon
                    className="size-4 sm:size-5 text-primary opacity-100"
                    opacity={1}
                    aria-hidden
                  />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">
                    AI Meeting Scheduler
                  </h3>
                  <CardAccent>
                    Auto-schedule and manage meetings with AI.
                  </CardAccent>
                </div>
                <div className="flex aspect-video items-center justify-center">
                  <ScheduleIllustation className="border" variant="outlined" />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mt-4 text-balance text-base sm:text-lg sm:max-w-[50ch] mx-auto">
                    Book, manage, and prep meetings. Auto-summarize agendas and
                    follow-ups.
                  </p>
                </div>
              </Card>

              {/* Row 3 (2 items) */}
              <Card className="relative p-4 sm:p-6">
                <CardTag />
                <div className="absolute left-3 top-3 z-10 space-y-1">
                  <SetupIcon
                    className="size-4 sm:size-5 text-primary opacity-100"
                    opacity={1}
                    aria-hidden
                  />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">
                    Content Planner
                  </h3>
                  <CardAccent>
                    Keep ideas, drafts, and cadence organized.
                  </CardAccent>
                </div>
                <div className="flex aspect-video items-center justify-center">
                  <div className="text-center">
                    <ul className="text-muted-foreground mx-auto w-fit font-mono text-base sm:text-lg md:text-xl font-medium">
                      <li>Blog post outline</li>
                      <li>Social content calendar</li>
                      <li>Landing page copy</li>
                    </ul>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mt-4 text-balance text-base sm:text-lg sm:max-w-[50ch] mx-auto">
                    Keep ideas, drafts, and publishing cadence organized.
                  </p>
                </div>
              </Card>
              <Card className="relative p-4 sm:p-6">
                <CardTag>optional</CardTag>
                <div className="absolute left-3 top-3 z-10 space-y-1">
                  <SetupIcon
                    className="size-4 sm:size-5 text-primary opacity-100"
                    opacity={1}
                    aria-hidden
                  />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">
                    Knowledge Base Assistant
                  </h3>
                  <CardAccent>Search and summarize from your docs.</CardAccent>
                </div>
                <div className="flex aspect-video items-center justify-center">
                  <div className="flex items-center gap-2 rounded-md  border-foreground/10 border p-2">
                    <ToggleGroup
                      size="sm"
                      className="gap-0.5 *:rounded-md"
                    >
                      <ToggleGroupItem value="bold" aria-label="Toggle bold">
                        <Bold className="size-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="italic"
                        aria-label="Toggle italic"
                      >
                        <Italic className="size-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="underline"
                        aria-label="Toggle underline"
                      >
                        <Underline className="size-4" />
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="strikethrough"
                        aria-label="Toggle strikethrough"
                      >
                        <Strikethrough className="size-4" />
                      </ToggleGroupItem>
                    </ToggleGroup>
                    <span className="bg-border block h-4 w-px"></span>
                    <Button size="icon" className="size-8" variant="ghost">
                      <Ellipsis className="size-3" />
                    </Button>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mt-4 text-balance text-base sm:text-lg sm:max-w-[50ch] mx-auto">
                    Search, summarize, and draft accurate answers from your
                    docs.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}

type IllustrationProps = {
  className?: string;
  variant?: "elevated" | "outlined" | "mixed";
};

export const ScheduleIllustation = ({
  className,
  variant = "elevated",
}: IllustrationProps) => {
  return (
    <div className={cn("relative", className)}>
      <div
        className={cn(
          "bg-background absolute left-1/2 top-6 -translate-x-1/2 flex items-center gap-2 rounded-md  p-1",
          {
            "shadow-black-950/10 shadow-lg": variant === "elevated",
            "border-foreground/10 border": variant === "outlined",
            "border-foreground/10 border shadow-md shadow-black/5":
              variant === "mixed",
          }
        )}
      >
        <Button size="sm" className="rounded-md">
          <Calendar1 className="size-3" />
          <span className="text-sm font-medium">Schedule</span>
        </Button>
        <span className="bg-border block h-4 w-px"></span>
        <ToggleGroup size="sm" className="gap-0.5 *:rounded-md">
          <ToggleGroupItem value="bold" aria-label="Toggle bold">
            <Bold className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="italic" aria-label="Toggle italic">
            <Italic className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="underline" aria-label="Toggle underline">
            <Underline className="size-4" />
          </ToggleGroupItem>
          <ToggleGroupItem
            value="strikethrough"
            aria-label="Toggle strikethrough"
          >
            <Strikethrough className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="bg-border block h-4 w-px"></span>
        <Button size="icon" className="size-8" variant="ghost">
          <Ellipsis className="size-3" />
        </Button>
      </div>
      <span>
        <span className="bg-secondary text-secondary-foreground py-1 text-xs sm:text-sm">
          Tomorrow 8:30 pm
        </span>{" "}
        is our priority.
      </span>
    </div>
  );
};

export const CodeIllustration = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_50%,transparent_100%)]",
        className
      )}
    >
      <ul className="text-muted-foreground mx-auto w-fit font-mono text-xl sm:text-2xl md:text-3xl font-medium">
        {["Images", "Variables", "Pages", "Components", "Styles"].map(
          (item, index) => (
            <li
              key={index}
              className={cn(
                index == 2 &&
                "text-foreground before:absolute before:-translate-x-[110%] before:text-orange-500 before:content-['Import']"
              )}
            >
              {item}
            </li>
          )
        )}
      </ul>
    </div>
  );
};
