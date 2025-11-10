"use client";

import { FreeIcon } from "@feedgot/ui/icons/free";
import { UsersIcon } from "@feedgot/ui/icons/users";
import { SetupIcon } from "@feedgot/ui/icons/setup";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";

export function HeroContent() {
  return (
    <div className="mx-auto max-w-5xl lg:max-w-6xl px-4 text-left" data-component="HeroContent">
      {/* Main heading */}
      <h1 className=" text-3xl sm:text-3xl md:text-5xl leading-tight tracking-normal sm:tracking-tight font-semibold text-foreground text-balance">
        The
        <span className="mx-2 inline-block rounded-md bg-primary/30 px-2 py-1 text-black/70 leading-none align-middle">
          simple and fast
        </span>
        <span className="block mt-0"> Customer feedback alternative</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-xl sm:max-w-2xl lg:max-w-3xl text-sm sm:text-base md:text-lg leading-relaxed text-accent text-balance">
        Feedgot is a privacy-first, open-source customer feedback platform that's both insightful and lightweight
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-start gap-3 sm:gap-4">
        <HotkeyLink
          href="/signup"
          hotkeyHref="https://dashboard.feedbot.com"
          className="w-full sm:w-auto min-h-[40px] min-w-[40px]"
          label="Add to your website"
        />
        <LiveDemo className="w-full sm:w-auto min-h-[40px] min-w-[40px]" />
      </div>
      <div
        className="mt-8 flex flex-wrap items-center gap-3 sm:gap-6 text-xs  text-accent"
        aria-label="Key highlights"
      >
        <span className="inline-flex items-center gap-2">
          <FreeIcon width={14} height={14} className="text-foreground" />
          Free forever
        </span>
        <span className=" inline-flex items-center gap-2">
          <SetupIcon width={14} height={14} className="text-foreground" />
          30-second setup
        </span>
        <span className="inline-flex items-center gap-2">
          <UsersIcon width={14} height={14} className="text-foreground" />
          Unlimited users
        </span>
      </div>
    </div>
  );
}
