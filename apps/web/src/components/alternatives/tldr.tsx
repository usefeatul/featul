import { MarketingContainer } from "@/components/layout/container";
import Link from "next/link";
import {
  ALTERNATIVES_UPDATED_LABEL,
  type Alternative,
} from "@/config/alternatives";
import { getAltDescription } from "@/types/descriptions";
import { AlternativeIcon } from "@featul/ui/icons/alternative";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { BookmarkIcon } from "@featul/ui/icons/bookmark";

import {
  modalCardInnerClass,
  modalCardShellClass,
} from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";

import { AUTH_SIGN_IN_URL } from "@/config/auth";

const comparisonCardClass = cn(
  modalCardShellClass,
  "flex h-full min-w-0 flex-col",
);
const comparisonCardHeaderClass =
  "flex items-center justify-between gap-3 px-2.5 py-1.5";
const comparisonCardBodyClass = cn(
  modalCardInnerClass,
  "flex-1 min-w-0 px-5 py-4 sm:px-6 sm:py-5",
);

export default function TLDR({ alt }: { alt: Alternative }) {
  const description = getAltDescription(alt.slug, "first");
  const victoryPoints = alt.victoryPoints?.slice(0, 3) ?? [];
  const tradeoffs = alt.tradeoffs?.slice(0, 2) ?? alt.pros?.slice(0, 2) ?? [];

  return (
    <MarketingContainer>
      <section className="py-16" data-component="TLDR">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <BookmarkIcon
              aria-hidden
              className="mb-2 size-5 text-primary sm:mb-3"
              opacity={1}
            />
            <p className="text-xs text-accent sm:text-sm">
              Updated {ALTERNATIVES_UPDATED_LABEL}
            </p>
          </div>
          <h2 className="mt-6 text-balance text-2xl font-semibold text-foreground sm:text-3xl lg:text-3xl">
            {alt.name} vs Featul: what is the short answer?
          </h2>

          <div className="mt-8 grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2">
            <article className={comparisonCardClass}>
              <div className={comparisonCardHeaderClass}>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-[5px]">
                    <AlternativeIcon
                      slug={alt.slug}
                      alt={`${alt.name} logo`}
                      size={20}
                      className="size-full object-cover"
                    />
                  </span>
                  <p className="text-sm font-medium leading-6 text-foreground">
                    {alt.name}
                  </p>
                </div>
              </div>
              <div className={comparisonCardBodyClass}>
                <p className="text-balance text-sm leading-7 text-accent sm:max-w-[60ch] sm:text-base">
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
              </div>
            </article>

            <article className={comparisonCardClass}>
              <div className={comparisonCardHeaderClass}>
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="flex size-5 shrink-0 items-center justify-center">
                    <FeatulLogoIcon className="size-5 text-primary" size={20} />
                  </span>
                  <p className="text-sm font-medium leading-6 text-foreground">
                    Featul
                  </p>
                </div>
                <Link
                  href={AUTH_SIGN_IN_URL}
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  data-sln-event="cta: tldr try featul clicked"
                >
                  Try free
                </Link>
              </div>
              <div className={comparisonCardBodyClass}>
                <p className="text-balance text-sm leading-7 text-accent sm:max-w-[60ch] sm:text-base">
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
              </div>
            </article>
          </div>
        </div>
      </section>
    </MarketingContainer>
  );
}
