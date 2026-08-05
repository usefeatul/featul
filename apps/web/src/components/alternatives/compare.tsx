import Link from "next/link";
import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { SITE_URL } from "@/config/seo";
import { StatusIcon } from "./icon";
import { SquareIcon } from "@featul/ui/icons/square";
// import { AccentBar } from "@featul/ui/components/cardElements";

export default function Compare({ alt }: { alt: Alternative }) {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16">
        <div className="mx-auto  w-full max-w-6xl px-0 sm:px-6">
          <SquareIcon aria-hidden className="size-5 text-primary" />
          <h2 className="mt-6 text-foreground text-balance text-2xl sm:text-3xl lg:text-3xl font-semibold">
            Side‑by‑side features
          </h2>
          <p className="text-accent mt-3">
            Quick comparison of essential capabilities across {alt.name} and
            Featul.
          </p>

          <div className="mt-12 sm:mt-14">
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(56px,auto)_minmax(56px,auto)] sm:grid-cols-[1.5fr_1fr_1fr] items-center gap-x-3 sm:gap-x-14 sticky top-2 z-10 rounded-md">
              <div className="pl-0 pr-2 sm:pr-4 py-2 sm:py-3 text-xs sm:text-lg font-semibold text-foreground text-left">
                Feature
              </div>
              <div className="px-1 sm:px-4 py-2 sm:py-3 text-xs sm:text-lg font-semibold text-foreground text-right">
                {alt.website ? (
                  <Link
                    href={alt.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline underline-offset-4"
                  >
                    {alt.name}
                  </Link>
                ) : (
                  alt.name
                )}
              </div>
              <div className="px-1 sm:px-4 py-2 sm:py-3 text-xs sm:text-lg font-semibold text-foreground text-right">
                <Link
                  href={SITE_URL}
                  className="hover:text-primary hover:underline underline-offset-4"
                >
                  Featul
                </Link>
              </div>
            </div>

            <ul className="divide-y divide-muted/30">
              {alt.features.map((f) => (
                <li
                  key={f.key}
                  className="grid p-1 grid-cols-[minmax(0,1fr)_minmax(56px,auto)_minmax(56px,auto)] sm:grid-cols-[1.5fr_1fr_1fr] items-center gap-x-3 sm:gap-x-14 hover:bg-muted/20"
                >
                  <div className="pl-0 pr-2 sm:pr-4 py-2 sm:py-3">
                    <div className="text-left space-y-1">
                      <div className="text-base sm:text-md font-semibold text-foreground">
                        {f.label}
                      </div>
                      {f.description && (
                        <p className="text-accent text-sm  leading-6 sm:leading-relaxed">
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
                  {/* Featul column (mobile & desktop) */}
                  <div className="px-0 sm:px-4 py-2 sm:py-3 min-w-[56px] flex items-center justify-center sm:justify-end gap-2 text-right">
                    <StatusIcon value={f.Featul} />
                    <span className="sr-only">
                      Featul: {String(f.Featul)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-accent/70 text-sm leading-6 text-balance sm:max-w-4xl">
            Partial means the feature is available with limitations or
            requires workarounds.
          </p>
          {/* <div className="mt-10 flex items-stretch gap-2">
            <AccentBar width={6} />
          </div> */}
        </div>
      </section>
    </Container>
  );
}
