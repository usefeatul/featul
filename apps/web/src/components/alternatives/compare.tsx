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
          <p className="text-zinc-500 mt-3">
            Quick comparison of essential capabilities across {alt.name} and Feedgot.
          </p>

          <div className="mt-10">
            <div className="grid grid-cols-[1.5fr_1fr_1fr] items-center gap-x-12 bg-muted/30">
              <div className="pl-0 pr-4 py-3 text-base sm:text-lg font-semibold text-foreground text-left">Feature</div>
              <div className="px-4 py-3 text-base sm:text-lg font-semibold text-foreground text-right">{alt.name}</div>
              <div className="px-4 py-3 text-base sm:text-lg font-semibold text-foreground text-right">Feedgot</div>
            </div>

            <ul>
              {alt.features.map((f) => (
                <li key={f.key} className="grid grid-cols-[1.5fr_1fr_1fr] items-start gap-x-12">
                  <div className="pl-0 pr-4 py-3">
                    <div className="text-left space-y-1">
                      <div className="text-md sm:text-lg font-semibold text-foreground">{f.label}</div>
                      {f.description && (
                        <p className="text-zinc-500 text-md leading-relaxed">
                          {f.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-2 justify-end text-right">
                    <StatusIcon value={f.competitor} />
                    <span className="sr-only">{String(f.competitor)}</span>
                  </div>
                  <div className="px-4 py-3 flex items-center gap-2 justify-end text-right">
                    <StatusIcon value={f.feedgot} />
                    <span className="sr-only">{String(f.feedgot)}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-zinc-500 mt-6 text-md sm:text-lg">
            Partial means the feature is available with limitations or requires workarounds.
          </p>
        </div>
      </section>
    </Container>
  );
}