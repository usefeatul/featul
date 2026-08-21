import Link from "next/link";
import { Container } from "@/components/global/container";
import {
  ALTERNATIVES_UPDATED_LABEL,
  type Alternative,
} from "@/config/alternatives";
import { getAltDescription } from "@/types/descriptions";
import { AlternativeIcon } from "@featul/ui/icons/alternative";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { BookmarkIcon } from "@featul/ui/icons/bookmark";

import { AUTH_SIGN_IN_URL } from "@/config/auth";
import { OverlayCard, OverlayCardPanel } from "@/components/shared/overlay-card";

export default function TLDR({ alt }: { alt: Alternative }) {
  const description = getAltDescription(alt.slug, "first");
  const victoryPoints = alt.victoryPoints?.slice(0, 3) ?? [];
  const tradeoffs = alt.tradeoffs?.slice(0, 2) ?? alt.pros?.slice(0, 2) ?? [];

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-16" data-component="TLDR">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BookmarkIcon aria-hidden className="mb-2 size-5 text-primary sm:mb-3" opacity={1} />
            <p className="text-xs text-accent sm:text-sm">
              Updated {ALTERNATIVES_UPDATED_LABEL}
            </p>
          </div>
          <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl lg:text-3xl">
            {alt.name} vs Featul: quick summary
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6">
            <OverlayCard>
              <OverlayCardPanel className="px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center overflow-hidden rounded-md bg-muted/40">
                  <AlternativeIcon
                    slug={alt.slug}
                    alt={`${alt.name} logo`}
                    size={32}
                    className="size-full object-cover"
                  />
                </span>
                <p className="text-sm font-semibold text-foreground">{alt.name}</p>
              </div>
              <p className="mt-3 text-balance text-sm leading-7 text-accent sm:max-w-[60ch] sm:text-base">
                {alt.summary ?? description}
              </p>
              {tradeoffs.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm leading-6 text-accent">
                  {tradeoffs.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/30" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              </OverlayCardPanel>
            </OverlayCard>

            <OverlayCard>
              <OverlayCardPanel className="px-4 py-3 sm:px-5 sm:py-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 items-center justify-center rounded-md bg-white">
                    <FeatulLogoIcon className="size-5 text-primary" size={20} />
                  </span>
                  <p className="text-sm font-semibold text-foreground">Featul</p>
                </div>
                <Link
                  href={AUTH_SIGN_IN_URL}
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  data-sln-event="cta: tldr try featul clicked"
                >
                  Try free
                </Link>
              </div>
              <p className="mt-3 text-balance text-sm leading-7 text-accent sm:max-w-[60ch] sm:text-base">
                Featul is a modern,
                <span className="ml-1 inline rounded-md bg-primary/40 px-1.5 py-0 text-black">
                  privacy‑first
                </span>{" "}
                {alt.name} alternative with EU hosting by default and an
                <span className="ml-1 inline rounded-md bg-primary/40 px-1.5 py-0 text-black">
                  end‑to‑end workflow
                </span>
                : feedback boards, public roadmap, and changelog.
              </p>
              {victoryPoints.length > 0 ? (
                <ul className="mt-4 space-y-2 text-sm leading-6 text-accent">
                  {victoryPoints.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
              </OverlayCardPanel>
            </OverlayCard>
          </div>
        </div>
      </section>
    </Container>
  );
}
