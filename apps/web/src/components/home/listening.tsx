import { Container } from "../global/container";
import { ChartIcon } from "@feedgot/ui/icons/chart";
import { LoveIcon } from "@feedgot/ui/icons/love";
import { SetupIcon } from "@feedgot/ui/icons/setup";
import { AccentBar } from "./cardElements";

export default function Listening() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section className="" data-component="Listening">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <h2 className="text-foreground text-balance text-2xl sm:text-3xl lg:text-3xl font-bold">
            Build what your users actually need.
            <span className="block mt-1">Listen and act.</span>
          </h2>
          <div className="mt-10 flex items-stretch gap-3">
            <AccentBar width={8} />
            <p className="text-accent text-md leading-6 text-balance sm:max-w-4xl">
              Feedgot gives every request a single homecaptured, organized, and
              ready to ship. No more buried DMs, scattered emails, or forgotten
              ideas.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10">
            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-rose-400 ring-1 ring-foreground/10 p-1 sm:p-1.5">
                  <LoveIcon aria-hidden className="size-4" />
                </span>
                <div>
                  <h3 className="text-foreground text-base font-medium">
                    Prioritize what users love
                  </h3>
                  <p className="text-accent mt-1 text-sm leading-6 sm:max-w-[34ch]">
                    Spot ideas with real momentum, not just the loudest voices.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-emerald-400 ring-1 ring-foreground/10 p-1 sm:p-1.5">
                  <ChartIcon aria-hidden className="size-4" />
                </span>
                <div>
                  <h3 className="text-foreground text-base font-medium">
                    Reduce churn
                  </h3>
                  <p className="text-accent mt-1 text-sm leading-6 sm:max-w-[34ch]">
                    Show progress on requests so customers stay and engage.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-blue-400 ring-1 ring-foreground/10 p-1 sm:p-1.5">
                  <SetupIcon aria-hidden className="size-4" opacity={1} />
                </span>
                <div>
                  <h3 className="text-foreground text-base font-medium">
                    Save hours each week
                  </h3>
                  <p className="text-accent mt-1 text-sm leading-6 sm:max-w-[34ch]">
                    Stop chasing feedback across docs, spreadsheets, and emails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
