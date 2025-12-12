import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { getAltDescription } from "@/types/descriptions";
import { BookmarkIcon } from "@oreilla/ui/icons/bookmark";

export default function TLDR({ alt }: { alt: Alternative }) {
  const description = getAltDescription(alt.slug, "first");

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section className="py-16" data-component="TLDR">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <BookmarkIcon aria-hidden className="size-5 text-primary mb-2 sm:mb-3" opacity={1} />
          <h2 className="mt-6 text-foreground text-balance text-2xl sm:text-3xl lg:text-3xl font-semibold">
            TL;DR comparison summary
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-accent mt-1 text-sm sm:text-base leading-7 text-balance sm:max-w-[60ch]">
                    {description}
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow">
              <div className="flex items-start gap-3">
                <div>
                  <p className="text-accent mt-1 text-sm sm:text-base leading-7 text-balance sm:max-w-[60ch]">
                    oreilla is a modern,
                    <span className="inline rounded-md bg-primary/50 px-2 py-0 text-black tracking-widest ml-1">
                      privacy‑first
                    </span>
                    alternative designed to be simple to set up and pleasant to use. With EU hosting by default and an
                    <span className="inline rounded-md bg-primary/50 px-2 py-0 text-black tracking-widest ml-1">
                      end‑to‑end workflow
                    </span>
                    —feedback boards, public roadmap, and changelog—you can get essential analytics and product signals without heavy configuration.
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
