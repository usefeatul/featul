"use client";

import { HeroCta } from "@/components/shared/cta";
import { HeroHighlights } from "@/components/shared/highlights";
import { AlternativeIcon } from "@featul/ui/icons/alternative";
import { useEffect, useState } from "react";
import { getAltDescription } from "@/types/descriptions";

export function AlternativeHeroContent({
  name,
  description,
  slug,
}: {
  name: string;
  description?: string;
  slug: string;
}) {
  const [clientDescription, setClientDescription] = useState<string | undefined>(undefined);

  useEffect(() => {
    setClientDescription(getAltDescription(slug, 'random'));
  }, [slug]);

  return (
    <div className="text-left" data-component="AlternativeHeroContent">
      <h1 className="max-w-3xl font-heading font-semibold tracking-tight text-white">
        <span className="block text-[2rem] leading-[1.15] text-balance sm:text-5xl sm:leading-tight md:text-6xl">
          The simple alternative to
        </span>

        <span className="mt-4 flex items-center gap-3 sm:mt-5 sm:gap-4">
          <span className="flex shrink-0 items-center justify-center rounded-xl bg-white p-2 shadow-[0_8px_28px_rgba(0,0,0,0.15)] ring-1 ring-white/70 sm:rounded-2xl sm:p-2.5">
            <AlternativeIcon
              slug={slug}
              alt={`${name} logo`}
              size={64}
              className="h-11 w-11 rounded-lg object-cover sm:h-12 sm:w-12 md:h-14 md:w-14"
            />
          </span>

          <span className="inline-flex items-center rounded-xl bg-white/20 px-3 py-1.5 text-[2rem] leading-none text-white backdrop-blur-sm sm:rounded-2xl sm:px-4 sm:py-2 sm:text-5xl md:text-6xl">
            {name}
          </span>
        </span>
      </h1>

      <p className="mt-4 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance [text-shadow:0_1px_6px_rgba(0,0,0,0.25)] sm:mt-6 sm:max-w-2xl sm:text-base md:text-lg">
        {clientDescription ?? description ?? (
          <>
            Compare {name} and Featul — transparent by design, focused on
            simplicity and user first UX. Organized feedback boards,
            auto-syncing roadmaps, and self-writing changelogs.
          </>
        )}
      </p>

      <HeroCta />
      <HeroHighlights />
    </div>
  );
}
