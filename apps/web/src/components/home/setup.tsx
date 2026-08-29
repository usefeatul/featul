"use client";
import { Container } from "../global/container";
import { SetupIcon } from "@featul/ui/icons/setup";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

const cards = [
  {
    title: "Launch a feedback portal",
    body: (
      <>
        Launch a public feedback portal on your own subdomain
        <span className="ml-1 inline rounded-md bg-primary/50 px-2 py-0 tracking-widest text-black">
          feedback.yourbrand.com
        </span>{" "}
        or use Featul&apos;s hosted space. Customers can browse ideas, vote on
        favorites, and submit new requests. No code required—just share the
        link.
      </>
    ),
  },
  {
    title: "Add the in‑app widget",
    body: (
      <>
        Add our in‑app widget with a light snippet
        <span className="ml-1 inline rounded-md bg-primary/50 px-2 py-0 tracking-widest text-black">
          {'<script src="..."></script>'}
        </span>{" "}
        so users can submit ideas without leaving. They see your roadmap and
        read changelogs in a beautiful floating widget that matches your brand.
      </>
    ),
  },
] as const;

export default function Setup() {
  return (
    <section className="relative my-12 sm:my-16" data-component="Setup">
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <SetupIcon aria-hidden className="size-5 text-primary mb-2 sm:mb-3" opacity={1} />
          <h2 className="font-heading mt-6 text-foreground text-balance text-2xl sm:text-3xl font-semibold">
            Set up in minutes
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {cards.map((card) => (
              <div key={card.title} className={cn(overlayDialogClass, "h-full")}>
                <div
                  className={cn(
                    overlayInnerClass,
                    "flex h-full flex-col px-4 py-3 sm:px-5 sm:py-4",
                  )}
                >
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 p-1 text-primary ring-1 ring-foreground/10 sm:p-1.5">
                      <SetupIcon aria-hidden className="size-4" opacity={1} />
                    </span>
                    <div>
                      <h3 className="text-foreground text-base sm:text-lg font-medium">
                        {card.title}
                      </h3>
                      <p className="text-accent mt-1 text-sm sm:text-base leading-7 text-balance sm:max-w-[60ch]">
                        {card.body}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
