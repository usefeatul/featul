import { Container } from "../global/container";
import { Card } from "@feedgot/ui/components/card";
import { Button } from "@feedgot/ui/components/button";
import {
  Bold,
  Calendar1,
  Ellipsis,
  Italic,
  Strikethrough,
  Underline,
} from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@feedgot/ui/components/toggle-group";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

const CardAccent = ({ children }: { children: ReactNode }) => (
  <p className="text-accent mt-1 text-sm sm:text-base">{children}</p>
);

const CardTag = ({ children = "no setup required" }: { children?: ReactNode }) => (
  <span className="absolute right-3 top-3 text-accent text-xs border border-border bg-background/80 backdrop-blur-sm rounded px-2 py-0.5">
    {children}
  </span>
);

export default function Create() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section>
        <div className="bg-background py-24">
          <div className="mx-auto w-full max-w-5xl px-6">
            <div>
              <h2 className="text-foreground mt-4 text-4xl font-semibold">
                Up and running in 30 seconds
              </h2>
              <p className="text-muted-foreground mb-12 mt-4 text-balance text-lg">
                Sign up with an email, create your workspace, then add one line
                of code or share your board link. You’re ready to collect feedback.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Card className="relative p-6">
                <CardTag />
                <div className="flex aspect-video items-center justify-center">
                  <CodeIllustration className="w-full" />
                </div>
                <div className="text-center">
                  <h3 className="text-foreground text-xl font-semibold">Marketing Campaigns</h3>
                  <CardAccent>Plan, track, and optimize campaigns.</CardAccent>
                  <p className="text-muted-foreground mt-4 text-balance text-lg">
                    Effortlessly plan and execute your marketing campaigns
                    organized.
                  </p>
                </div>
              </Card>
              <Card className="relative p-6">
                <CardTag />
                <div className="flex aspect-video items-center justify-center">
                  <ScheduleIllustation className="border" variant="mixed" />
                </div>
                <div className="text-center">
                  <h3 className="text-foreground text-xl font-semibold">AI Meeting Scheduler</h3>
                  <CardAccent>Auto-schedule and manage meetings with AI.</CardAccent>
                  <p className="text-muted-foreground mt-4 text-balance text-lg">
                    Effortlessly book and manage your meetings. Stay on top of
                    your schedule.
                  </p>
                </div>
              </Card>
              <Card className="relative p-6 col-span-2">
                <CardTag />
                <div className="flex h-32 sm:h-40 items-center justify-center">
                  <ScheduleIllustation className="border" variant="mixed" />
                </div>
                <div className="text-center">
                  <h3 className="text-foreground text-xl font-semibold">Create workspace</h3>
                  <CardAccent>Get started in seconds.</CardAccent>
                  <p className="text-muted-foreground mt-4 text-balance text-lg">
                    Sign up with just an email and pick a name — that’s it.
                  </p>
                </div>
              </Card>
            </div>

            <div className="mt-10 flex items-start gap-3">
              <div className="h-5 w-[4px] bg-primary rounded-full" aria-hidden />
              <p className="text-accent text-sm sm:text-base">
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
          "bg-background absolute left-1/2 top-6 -translate-x-1/2 flex items-center gap-2 rounded-lg p-1",
          {
            "shadow-black-950/10 shadow-lg": variant === "elevated",
            "border-foreground/10 border": variant === "outlined",
            "border-foreground/10 border shadow-md shadow-black/5": variant === "mixed",
          }
        )}
      >
        <Button size="sm" className="rounded-sm">
          <Calendar1 className="size-3" />
          <span className="text-sm font-medium">Schedule</span>
        </Button>
        <span className="bg-border block h-4 w-px"></span>
        <ToggleGroup type="multiple" size="sm" className="gap-0.5 *:rounded-md">
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
        <span className="bg-secondary text-secondary-foreground py-1">Tomorrow 8:30 pm</span>{" "}
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
      <ul className="text-muted-foreground mx-auto w-fit font-mono text-2xl font-medium">
        {["Images", "Variables", "Pages", "Components", "Styles"].map((item, index) => (
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