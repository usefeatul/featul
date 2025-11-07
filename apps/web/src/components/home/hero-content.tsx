"use client";

import { FreeIcon } from "@feedgot/ui/icons/free";
import { UsersIcon } from "@feedgot/ui/icons/users";
import { SetupIcon } from "@feedgot/ui/icons/setup";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";

export function HeroContent() {
  return (
    <div className="mx-auto max-w-5xl lg:max-w-6xl px-0 text-left">
      {/* Main heading */}
      <h1 className=" text-3xl sm:text-3xl md:text-5xl leading-tight tracking-normal sm:tracking-tight font-extrabold text-foreground text-balance">
        The
        <span className="mx-2 inline-block rounded-md bg-primary/15 px-3 py-0 text-primary leading-none align-middle">
          simple, fast and privacy-first
        </span>
        <span className="block mt-0">feedback alternative</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-3xl sm:max-w-4xl lg:max-w-5xl text-base sm:text-lg md:text-xl leading-relaxed text-accent text-balance">
        Feedgot focuses on what feedback tools overlook — transparent, simple,
        privacy-first product feedback with organized boards, auto-syncing
        roadmaps, and self-writing changelogs.
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4">
        <HotkeyLink
          href="/signup"
          hotkeyHref="https://dashboard.feedbot.com"
          className="w-full sm:w-auto"
          label="Add to your website"
        />
        <LiveDemo className="w-full sm:w-auto text-accent" />
      </div>

      {/* Reassurance microcopy */}
      <p className="mt-3 text-xs sm:text-sm text-accent">
        no credit card required. no obligation. quick setup.
      </p>

      {/* Feature highlights row */}
      <div
        className="mt-8 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm md:text-base text-accent"
        aria-label="Key highlights"
      >
        <span className="inline-flex items-center gap-2">
          <FreeIcon width={18} height={18} className="text-foreground" />
          Free forever
        </span>
        <span className=" inline-flex items-center gap-2">
          <SetupIcon width={18} height={18} className="text-foreground" />
          30-second setup
        </span>
        <span className="inline-flex items-center gap-2">
          <UsersIcon width={18} height={18} className="text-foreground" />
          Unlimited users
        </span>
      </div>
    </div>
  );
}
