"use client";

import Link from "next/link";
import { HeroHighlights } from "@/components/shared/highlights";
import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";

import { AUTH_SIGN_IN_URL } from "@/config/auth";

const heroButtonClassName =
  "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto";

export function UseCaseHeroContent({
  title,
  description,
  badge,
}: {
  title: string;
  description?: string;
  badge?: string;
}) {
  return (
    <div className="text-left" data-component="UseCaseHeroContent">
      {badge ? (
        <p className="mb-3 text-sm font-medium text-white/80">{badge}</p>
      ) : null}

      <h1 className="max-w-3xl font-heading text-[1.75rem] font-semibold leading-[1.2] tracking-tight text-white text-balance sm:text-4xl sm:leading-tight md:text-5xl">
        {title}
      </h1>

      {description ? (
        <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg">
          {description}
        </p>
      ) : null}

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
            href={AUTH_SIGN_IN_URL}
            data-sln-event="cta: use case try featul clicked"
            className="font-heading"
          >
            Try Featul free
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="nav"
          className={cn(heroButtonClassName, "text-accent")}
        >
          <Link href="/use-cases" className="font-heading">
            All use cases
          </Link>
        </Button>
      </div>

      <HeroHighlights />
    </div>
  );
}
