import { Container } from "../global/container";
import { ChartIcon } from "@featul/ui/icons/chart";
import { LoveIcon } from "@featul/ui/icons/love";
import { SetupIcon } from "@featul/ui/icons/setup";
import { AccentBar } from "@featul/ui/components/cardElements";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

const cards = [
  {
    title: "Prioritize what users love",
    description: "Spot ideas with real momentum, not just the loudest voices.",
    icon: LoveIcon,
    iconClassName: "text-rose-400",
  },
  {
    title: "Reduce churn",
    description: "Show progress on requests so customers stay and engage.",
    icon: ChartIcon,
    iconClassName: "text-emerald-400",
  },
  {
    title: "Save hours each week",
    description: "Stop chasing feedback across docs, spreadsheets, and emails.",
    icon: SetupIcon,
    iconClassName: "text-blue-400",
  },
] as const;

export default function Listening() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="my-6 sm:my-8" data-component="Listening">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <h2 className="font-heading text-foreground text-balance text-2xl sm:text-3xl lg:text-3xl font-bold">
            Build what your users actually need.
            <span className="block mt-1">Listen and act.</span>
          </h2>
          <div className="mt-10 flex items-stretch gap-3">
            <AccentBar width={8} />
            <p className="text-accent text-md leading-6 text-balance sm:max-w-4xl">
              Featul keeps feedback organized in one place, so teams can spot
              what matters and ship with more confidence.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div
                  key={card.title}
                  className={cn(overlayDialogClass, "h-full")}
                >
                  <div
                    className={cn(
                      overlayInnerClass,
                      "flex h-full flex-col px-4 py-3 sm:px-5 sm:py-4",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={cn(
                          "inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 ring-1 ring-foreground/10 p-1 sm:p-1.5",
                          card.iconClassName,
                        )}
                      >
                        <Icon aria-hidden className="size-4" opacity={1} />
                      </span>
                      <div>
                        <h3 className="text-foreground text-base font-medium">
                          {card.title}
                        </h3>
                        <p className="text-accent mt-1 text-sm leading-6 sm:max-w-[34ch]">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Container>
  );
}
