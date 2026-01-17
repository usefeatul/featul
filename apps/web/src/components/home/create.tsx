import { Container } from "../global/container";
import { Card } from "@featul/ui/components/card";
import { Button } from "@featul/ui/components/button";
import {
  Bold,
  Calendar1,
  Ellipsis,
  Italic,
  Strikethrough,
  Underline,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@featul/ui/components/toggle-group";
import { cn } from "@featul/ui/lib/utils";
import { CardAccent, CardTag, AccentBar } from "@featul/ui/components/cardElements";
import { ChartIcon } from "@featul/ui/icons/chart";
import { UsersIcon } from "@featul/ui/icons/users";
import { SetupIcon } from "@featul/ui/icons/setup";
import FeatureCard from "./featureCard";


export default function Create() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section>
        <div className="bg-background py-16 sm:py-24">
          <div className="mx-auto w-full px-1 sm:px-6 max-w-5xl ">
            <div>
              <h2 className="text-foreground mt-4 text-2xl sm:text-3xl lg:text-3xl font-semibold">
                Up and running in 30 seconds
              </h2>
              <div className="mt-10 flex items-start gap-2">
                <AccentBar width={8} />
                <p className="text-accent text-sm sm:text-base">
                  Sign up with an email, create your workspace, then add one line
                  of code or share your board link. You’re ready to collect feedback.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-8">
              <Card className="relative p-4 sm:p-6">
                <CardTag />
                <div className="absolute left-3 top-3 z-10 space-y-1">
                  <ChartIcon className="size-4 text-primary opacity-100" opacity={1} aria-hidden />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">Marketing Campaigns</h3>
                  <CardAccent>Plan, track, and optimize campaigns.</CardAccent>
                </div>
                <div className="flex aspect-video items-center justify-center">
                  <CodeIllustration className="w-full" />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mt-4 text-balance text-base sm:text-lg">
                    Effortlessly plan and execute your marketing campaigns
                    organized.
                  </p>
                </div>
              </Card>
              <Card className="relative p-4 sm:p-6">
                <CardTag />
                <div className="absolute left-3 top-3 z-10 space-y-1">
                  <UsersIcon className="size-4 text-primary opacity-100" opacity={1} aria-hidden />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">AI Meeting Scheduler</h3>
                  <CardAccent>Auto-schedule and manage meetings with AI.</CardAccent>
                </div>
                <div className="flex aspect-video items-center justify-center">
                  <ScheduleIllustation className="border" variant="mixed" />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mt-4 text-balance text-base sm:text-lg">
                    Effortlessly book and manage your meetings. Stay on top of
                    your schedule.
                  </p>
                </div>
              </Card>
              <Card className="relative p-4 sm:p-6 sm:col-span-2">
                <CardTag />
                <div className="absolute left-3 top-3 z-10 space-y-1">
                  <SetupIcon className="size-4 text-primary opacity-100" opacity={1} aria-hidden />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">Create workspace</h3>
                  <CardAccent>Get started in seconds.</CardAccent>
                </div>
                <div className="flex h-32 sm:h-40 items-center justify-center">
                  <ScheduleIllustation className="border" variant="mixed" />
                </div>
                <div className="text-center">
                  <p className="text-muted-foreground mt-4 text-balance text-base sm:text-lg">
                    Sign up with just an email and pick a name — that’s it.
                  </p>
                </div>
              </Card>
            </div>

            <FeatureCard withinContainer={false} />
            <div className="mt-10 flex items-start gap-2">
              <AccentBar width={8} />
              <p className="text-accent/80 text-sm">
                Seriously, it’s that simple. Most teams collect feedback within minutes of signup.
              </p>
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
            "border-foreground/10 border shadow-md shadow-black/5": variant === "mixed",
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
          <ToggleGroupItem value="strikethrough" aria-label="Toggle strikethrough">
            <Strikethrough className="size-4" />
          </ToggleGroupItem>
        </ToggleGroup>
        <span className="bg-border block h-4 w-px"></span>
        <Button size="icon" className="size-8" variant="ghost">
          <Ellipsis className="size-3" />
        </Button>
      </div>
      <span>
        <span className="bg-secondary text-secondary-foreground py-1 text-xs sm:text-sm">Tomorrow 8:30 pm</span>{" "}
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
      <ul className="text-muted-foreground mx-auto w-fit font-mono text-xl sm:text-2xl font-medium">
        {["Variables", "Pages", "Components",].map((item, index) => (
          <li
            key={index}
            className={cn(
              index == 2 &&
              "text-foreground before:absolute before:-translate-x-[110%] before:text-orange-500 before:content-['Import']"
            )}
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};