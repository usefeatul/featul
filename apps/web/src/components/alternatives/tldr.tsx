import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { getAltDescription } from "@/types/descriptions";
import { BookmarkIcon } from "@feedgot/ui/icons/bookmark";

export default function TLDR({ alt }: { alt: Alternative }) {
  const description = getAltDescription(alt.slug, "first");

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section className="py-12">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <BookmarkIcon aria-hidden className="size-5 text-primary" />
          <h2 className="mt-6 text-foreground text-balance text-1xl sm:text-2xl font-semibold">
            TL;DR comparison summary
          </h2>
          <div className="mt-4 grid gap-6 sm:grid-cols-2">
            <div className="rounded-lg p-0">
              <p className="text-zinc-500 text-base sm:text-md tracking-widest leading-7 text-balance">
                {description}
              </p>
            </div>
            <div className="rounded-lg p-0">
              <p className="text-zinc-500 text-base sm:text-md tracking-wide leading-7 text-balance">
                Feedgot is a modern,
                <span className="inline rounded-md bg-primary/15 px-2 py-0 text-primary tracking-widest">
                  privacy‑first
                </span>
                alternative designed to be simple to set up and pleasant to use.
                With EU hosting by default and an
                <span className="inline rounded-md bg-primary/15 px-2 py-0 text-primary tracking-widest">
                  end‑to‑end workflow
                </span>
                —feedback boards, public roadmap, and changelog—you can get
                essential analytics and product signals without heavy
                configuration.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
