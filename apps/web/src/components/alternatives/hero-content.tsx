"use client";
import { HotkeyLink } from "@/components/global/hotkey-link";
import { LiveDemo } from "@/components/global/live-demo";

export function AlternativeHeroContent({
  name,
  description,
}: {
  name: string;
  description?: string;
}) {
  return (
    <div className="w-full max-w-2xl sm:max-w-3xl text-left mt-14 sm:mt-0 mr-auto self-start justify-self-start">
      {/* Main heading */}
      <h1 className=" text-3xl  leading-tight tracking-normal sm:tracking-tight font-extrabold text-foreground text-balance">
        The simple,
        <span className="block mt-0">alternative to {name}</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-3xl sm:max-w-4xl lg:max-w-5xl text-xs sm:text-sm md:text-base leading-relaxed text-accent text-balance">
        {description ?? (
          <>
            Compare {name} and Feedgot — transparent by design, focused on
            simplicity and user first UX. Organized feedback boards,
            auto-syncing roadmaps, and self-writing changelogs.
          </>
        )}
      </p>

      {/* CTA + microcopy wrapper: full width on mobile, fits row on larger screens */}
      <div className="mt-8 w-full sm:w-fit">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4">
          <HotkeyLink className="w-full sm:w-auto" />
          <LiveDemo className="w-full sm:w-auto text-accent" />
        </div>

        {/* Reassurance microcopy centered to match button row width */}
        <p className="mt-4 text-left text-xs sm:text-sm text-accent">
          <span className="block sm:inline text-black">
            no credit card required.
          </span>
          <span className="sm:ml-1">no obligation.</span>
          <span className="sm:ml-1">quick setup.</span>
        </p>
      </div>
    </div>
  );
}
