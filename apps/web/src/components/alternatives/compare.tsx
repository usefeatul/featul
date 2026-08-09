import Link from "next/link";
import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { SITE_URL } from "@/config/seo";
import { StatusIcon } from "./icon";
import { SquareIcon } from "@featul/ui/icons/square";

export default function Compare({ alt }: { alt: Alternative }) {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="Compare">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <SquareIcon aria-hidden className="size-5 text-primary" />
          <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl lg:text-3xl">
            Side‑by‑side features
          </h2>
          <p className="mt-3 text-accent">
            Quick comparison of essential capabilities across {alt.name} and
            Featul.
          </p>

          <div className="mt-12 sm:mt-14">
            <div className="sticky top-2 z-10 grid grid-cols-[minmax(0,1fr)_minmax(56px,auto)_minmax(56px,auto)] items-center gap-x-3 border-b border-border/70 bg-background/95 sm:grid-cols-[1.5fr_1fr_1fr] sm:gap-x-14">
              <div className="py-2.5 text-left text-xs font-semibold text-foreground sm:py-3 sm:text-lg">
                Feature
              </div>
              <div className="py-2.5 text-right text-xs font-semibold text-foreground/70 sm:py-3 sm:text-lg">
                {alt.website ? (
                  <Link
                    href={alt.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-foreground hover:underline underline-offset-4"
                  >
                    {alt.name}
                  </Link>
                ) : (
                  alt.name
                )}
              </div>
              <div className="py-2.5 text-right text-xs font-semibold text-primary sm:py-3 sm:text-lg">
                <Link
                  href={SITE_URL}
                  className="hover:underline underline-offset-4"
                >
                  Featul
                </Link>
              </div>
            </div>

            <ul className="divide-y divide-muted/30">
              {alt.features.map((f) => (
                <li
                  key={f.key}
                  className="grid grid-cols-[minmax(0,1fr)_minmax(56px,auto)_minmax(56px,auto)] items-center gap-x-3 p-1 hover:bg-muted/20 sm:grid-cols-[1.5fr_1fr_1fr] sm:gap-x-14"
                >
                  <div className="py-2 sm:py-3">
                    <div className="space-y-1 text-left">
                      <div className="text-base font-semibold text-foreground sm:text-md">
                        {f.label}
                      </div>
                      {f.description ? (
                        <p className="text-sm leading-6 text-accent sm:leading-relaxed">
                          {f.description}
                        </p>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex min-w-[56px] items-center justify-center py-2 opacity-80 sm:justify-end sm:px-4 sm:py-3">
                    <StatusIcon value={f.competitor} />
                    <span className="sr-only">
                      {alt.name}: {String(f.competitor)}
                    </span>
                  </div>
                  <div className="flex min-w-[56px] items-center justify-center py-2 sm:justify-end sm:px-4 sm:py-3">
                    <StatusIcon value={f.Featul} />
                    <span className="sr-only">
                      Featul: {String(f.Featul)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-4 text-balance text-sm leading-6 text-accent/70 sm:max-w-4xl">
            Partial means the feature is available with limitations or
            requires workarounds.
          </p>
        </div>
      </section>
    </Container>
  );
}
