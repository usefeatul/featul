import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { StatusIcon } from "./status-icon";
import { SquareIcon } from "@feedgot/ui/icons/square";

export default function Compare({ alt }: { alt: Alternative }) {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <SquareIcon aria-hidden className="size-5 text-primary" />
          <h2 className="mt-6 text-foreground text-balance text-3xl sm:text-4xl font-semibold">
            Side‑by‑side features
          </h2>
          <p className="text-accent mt-3">
            Quick comparison of essential capabilities across {alt.name} and
            Feedgot.
          </p>

          <div className="mt-10">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(56px,auto)_minmax(56px,auto)] sm:grid-cols-[1.5fr_1fr_1fr] items-center gap-x-2 sm:gap-x-12 bg-muted/30 sticky top-2 z-10 rounded-md">
              <div className="pl-0 pr-2 sm:pr-4 py-2 sm:py-3 text-xs sm:text-lg font-semibold text-foreground text-left">
                Feature
              </div>
              <div className="px-1 sm:px-4 py-2 sm:py-3 text-xs sm:text-lg font-semibold text-foreground text-right">
                {alt.name}
              </div>
              <div className="px-1 sm:px-4 py-2 sm:py-3 text-xs sm:text-lg font-semibold text-foreground text-right">
                Feedgot
              </div>
            </div>

            <ul className="divide-y divide-muted/30">
              {alt.features.map((f) => (
                <li
                  key={f.key}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(56px,auto)_minmax(56px,auto)] sm:grid-cols-[1.5fr_1fr_1fr] items-center gap-x-2 sm:gap-x-12"
                >
                  <div className="pl-0 pr-2 sm:pr-4 py-2 sm:py-3">
                    <div className="text-left space-y-1">
                      <div className="text-base sm:text-lg font-semibold text-foreground">
                        {f.label}
                      </div>
                      {f.description && (
                        <p className="text-accent text-sm sm:text-md leading-6 sm:leading-relaxed">
                          {f.description}
                        </p>
                      )}
                    </div>
                  </div>
                  {/* Competitor column (mobile & desktop) */}
                  <div className="px-0 sm:px-4 py-2 sm:py-3 min-w-[56px] flex items-center justify-center sm:justify-end gap-2 text-right">
                    <StatusIcon value={f.competitor} />
                    <span className="sr-only">
                      {alt.name}: {String(f.competitor)}
                    </span>
                  </div>
                  {/* Feedgot column (mobile & desktop) */}
                  <div className="px-0 sm:px-4 py-2 sm:py-3 min-w-[56px] flex items-center justify-center sm:justify-end gap-2 text-right">
                    <StatusIcon value={f.feedgot} />
                    <span className="sr-only">
                      Feedgot: {String(f.feedgot)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-accent mt-6 text-md sm:text-lg">
            Partial means the feature is available with limitations or requires
            workarounds.
          </p>
        </div>
      </section>
    </Container>
  );
}
