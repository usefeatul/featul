"use client";

import Link from "next/link";
import type { ComponentType } from "react";
import { HeroHighlights } from "@/components/shared/highlights";
import { Button } from "@featul/ui/components/button";
import { LinkIcon } from "@featul/ui/icons/link";
import { cn } from "@featul/ui/lib/utils";

const FEATUL_SIGN_IN_URL = "https://app.featul.com/auth/sign-in";

const heroButtonClassName =
  "h-10 min-h-[40px] w-full min-w-[40px] sm:w-auto";

type IconProps = { className?: string; size?: number };

export function IntegrationHeroContent({
  name,
  description,
  website,
  Icon,
}: {
  name: string;
  description?: string;
  website?: string;
  Icon: ComponentType<IconProps>;
}) {
  return (
    <div className="text-left" data-component="IntegrationHeroContent">
      <h1 className="max-w-3xl font-heading font-semibold tracking-tight text-white">
        <span className="block text-[2rem] leading-[1.15] text-balance sm:text-5xl sm:leading-tight md:text-6xl">
          Featul + {name}
        </span>

        <span className="mt-4 flex items-stretch gap-3 sm:mt-5 sm:gap-4">
          {website ? (
            <Link
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-white/70 transition-opacity hover:opacity-90 sm:size-16 sm:rounded-2xl sm:p-2.5 md:size-[4.5rem]"
              aria-label={`Visit ${name} website`}
            >
              <Icon className="size-8 text-foreground sm:size-9 md:size-10" />
            </Link>
          ) : (
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-white p-2 ring-1 ring-white/70 sm:size-16 sm:rounded-2xl sm:p-2.5 md:size-[4.5rem]">
              <Icon className="size-8 text-foreground sm:size-9 md:size-10" />
            </span>
          )}

          <span className="inline-flex h-14 items-center rounded-xl bg-white/20 px-3 text-2xl leading-none text-white backdrop-blur-sm sm:h-16 sm:rounded-2xl sm:px-4 sm:text-3xl md:h-[4.5rem] md:text-4xl">
            {name} integration
          </span>
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg">
        {description ??
          `Connect Featul with ${name} to keep feedback, roadmaps, and updates in sync.`}
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
            data-sln-event="cta: integration connect clicked"
            className="font-heading"
          >
            Connect {name}
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
              data-sln-event="cta: visit integration website clicked"
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
