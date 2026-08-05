"use client";

import Link from "next/link";
import { HeroHighlights } from "@/components/shared/highlights";
import { AlternativeIcon } from "@featul/ui/icons/alternative";
import { Button } from "@featul/ui/components/button";
import { LinkIcon } from "@featul/ui/icons/link";
import { cn } from "@featul/ui/lib/utils";

const FEATUL_SIGN_IN_URL = "https://app.featul.com/auth/sign-in";

const heroButtonClassName =
  "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto";

export function AlternativeHeroContent({
  name,
  description,
  slug,
  website,
}: {
  name: string;
  description?: string;
  slug: string;
  website?: string;
}) {
  return (
    <div className="text-left" data-component="AlternativeHeroContent">
      <h1 className="max-w-3xl font-heading font-semibold tracking-tight text-white">
        <span className="block text-[2rem] leading-[1.15] text-balance sm:text-5xl sm:leading-tight md:text-6xl">
          Best {name} alternative
        </span>

        <span className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-4">
          {website ? (
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-[0_8px_28px_rgba(0,0,0,0.15)] ring-1 ring-white/70 transition-opacity hover:opacity-90 sm:rounded-2xl sm:p-2.5"
              aria-label={`Visit ${name} website`}
            >
              <AlternativeIcon
                slug={slug}
                alt={`${name} logo`}
                size={64}
                className="h-11 w-11 rounded-lg object-cover sm:h-12 sm:w-12 md:h-14 md:w-14"
              />
            </Link>
          ) : (
            <span className="flex shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-[0_8px_28px_rgba(0,0,0,0.15)] ring-1 ring-white/70 sm:rounded-2xl sm:p-2.5">
              <AlternativeIcon
                slug={slug}
                alt={`${name} logo`}
                size={64}
                className="h-11 w-11 rounded-lg object-cover sm:h-12 sm:w-12 md:h-14 md:w-14"
              />
            </span>
          )}

          {website ? (
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center rounded-xl bg-white/20 px-3 py-1.5 text-[1.35rem] leading-none text-white backdrop-blur-sm transition-colors hover:bg-white/30 sm:rounded-2xl sm:px-4 sm:py-2 sm:text-3xl md:text-4xl"
            >
              Featul vs {name}
            </Link>
          ) : (
            <span className="inline-flex items-center rounded-xl bg-white/20 px-3 py-1.5 text-[1.35rem] leading-none text-white backdrop-blur-sm sm:rounded-2xl sm:px-4 sm:py-2 sm:text-3xl md:text-4xl">
              Featul vs {name}
            </span>
          )}
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance [text-shadow:0_1px_6px_rgba(0,0,0,0.25)] sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg">
        {description ?? (
          <>
            Compare {name} and Featul — privacy-first feedback boards,
            auto-syncing roadmaps, and self-writing changelogs.
          </>
        )}
      </p>

      <div className="mt-6 flex flex-col items-stretch justify-start gap-3 sm:mt-8 sm:flex-row sm:items-center sm:gap-4">
        <Button
          asChild
          size="lg"
          variant="nav"
          className={cn(
            heroButtonClassName,
            "border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
          )}
        >
          <Link
            href={FEATUL_SIGN_IN_URL}
            data-sln-event="cta: alternatives sign in clicked"
            className="font-heading"
          >
            Try Featul free
          </Link>
        </Button>

        {website ? (
          <Button
            asChild
            size="lg"
            variant="nav"
            className={cn(heroButtonClassName, "text-accent")}
          >
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Visit ${name} website`}
              data-sln-event="cta: visit alternative website clicked"
              className="font-heading"
            >
              Visit {name}
              <LinkIcon aria-hidden className="size-4" />
            </Link>
          </Button>
        ) : null}
      </div>

      <HeroHighlights />
    </div>
  );
}
