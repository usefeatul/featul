import { Container } from "../global/container";
import { LockIcon } from "@featul/ui/icons/lock";
import { ShieldIcon } from "@featul/ui/icons/shield";
import { UserFocusIcon } from "@featul/ui/icons/userfocus";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { visualIconTileClass } from "./visual-well";

const cards = [
  {
    title: "Keep some boards private",
    icon: LockIcon,
    body: "Give a key account their own board without putting every request on the public portal. Your team still sees the full picture. Customers only see what you choose to share.",
  },
  {
    title: "Collect guest feedback safely",
    icon: UserFocusIcon,
    body: "Let people vote and submit without creating an account, and mask identities when a public board should not show names. You keep the signal. They keep their privacy.",
  },
] as const;

export default function Access() {
  return (
    <section className="relative my-12 sm:my-16" data-component="Access">
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <ShieldIcon aria-hidden className="mb-2 size-5 text-primary sm:mb-3" opacity={1} />
          <h2 className="font-heading mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl">
            Control who sees what
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.title} className={cn(overlayDialogClass, "h-full")}>
                  <div
                    className={cn(
                      overlayInnerClass,
                      "flex h-full flex-col px-4 py-3 sm:px-5 sm:py-4",
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span className={visualIconTileClass}>
                        <Icon aria-hidden className="size-4" />
                      </span>
                      <div>
                        <h3 className="text-base font-medium text-foreground sm:text-lg">
                          {card.title}
                        </h3>
                        <p className="text-accent mt-1 text-pretty text-sm leading-7 sm:max-w-[60ch] sm:text-base">
                          {card.body}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
