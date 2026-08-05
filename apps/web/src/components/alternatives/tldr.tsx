import { Container } from "@/components/global/container";
import {
  ALTERNATIVES_UPDATED_LABEL,
  type Alternative,
} from "@/config/alternatives";
import { getAltDescription } from "@/types/descriptions";
import { BookmarkIcon } from "@featul/ui/icons/bookmark";

export default function TLDR({ alt }: { alt: Alternative }) {
  const description = getAltDescription(alt.slug, "first");
  const victoryPoints = alt.victoryPoints?.slice(0, 3) ?? [];
  const tradeoffs = alt.tradeoffs?.slice(0, 2) ?? alt.pros?.slice(0, 2) ?? [];

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="TLDR">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BookmarkIcon aria-hidden className="size-5 text-primary mb-2 sm:mb-3" opacity={1} />
            <p className="text-accent text-xs sm:text-sm">
              Updated {ALTERNATIVES_UPDATED_LABEL}
            </p>
          </div>
          <h2 className="mt-6 text-foreground text-balance text-2xl sm:text-3xl lg:text-3xl font-semibold">
            {alt.name} vs Featul: quick summary
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow">
              <p className="text-foreground text-sm font-semibold">{alt.name}</p>
              <p className="text-accent mt-2 text-sm sm:text-base leading-7 text-balance sm:max-w-[60ch]">
                {alt.summary ?? description}
              </p>
              {tradeoffs.length > 0 ? (
                <ul className="mt-4 space-y-2 text-accent text-sm leading-6">
                  {tradeoffs.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow">
              <p className="text-foreground text-sm font-semibold">Featul</p>
              <p className="text-accent mt-2 text-sm sm:text-base leading-7 text-balance sm:max-w-[60ch]">
                Featul is a modern,
                <span className="inline rounded-md bg-primary/50 px-2 py-0 text-black tracking-widest ml-1">
                  privacy‑first
                </span>
                {alt.name} alternative with EU hosting by default and an
                <span className="inline rounded-md bg-primary/50 px-2 py-0 text-black tracking-widest ml-1">
                  end‑to‑end workflow
                </span>
                —feedback boards, public roadmap, and changelog.
              </p>
              {victoryPoints.length > 0 ? (
                <ul className="mt-4 space-y-2 text-accent text-sm leading-6">
                  {victoryPoints.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
