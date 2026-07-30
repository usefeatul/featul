"use client";

import { FreeIcon } from "@featul/ui/icons/free";
import { UsersIcon } from "@featul/ui/icons/users";
import { SetupIcon } from "@featul/ui/icons/setup";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";

export function HeroContent() {
  return (
    <div className="text-left" data-component="HeroContent">
      <h1 className="max-w-3xl font-heading text-4xl font-semibold leading-tight tracking-tight text-white text-balance sm:text-5xl md:text-6xl">
        Customer feedback,{" "}
        <span className="inline-flex items-center rounded-md bg-white/20 px-2 py-[2px] align-baseline text-white backdrop-blur-sm">
          simple and fast
        </span>
      </h1>

      <p className="mt-6 max-w-xl text-sm font-light leading-relaxed text-white/95 text-balance [text-shadow:0_1px_6px_rgba(0,0,0,0.25)] sm:max-w-2xl sm:text-base md:text-lg">
        Featul is a privacy-first, open-source feedback platform. Collect
        requests, share your roadmap and publish changelogs &mdash; all in one
        lightweight workspace.
      </p>

      <div className="mt-8 flex flex-col items-stretch justify-start gap-3 sm:flex-row sm:items-center sm:gap-4">
        <HotkeyLink className="w-full sm:w-auto" label="Add to your website" />
        <LiveDemo className="min-h-[40px] w-full min-w-[40px] text-accent sm:w-auto" />
      </div>

      <div
        className="mt-8 flex flex-wrap items-center gap-3 text-xs font-light text-white [text-shadow:0_1px_4px_rgba(0,0,0,0.35)] sm:gap-6"
        aria-label="Key highlights"
      >
        <span className="inline-flex items-center gap-2">
          <FreeIcon width={14} height={14} className="text-white" />
          Free forever
        </span>
        <span className="inline-flex items-center gap-2">
          <SetupIcon width={14} height={14} className="text-white" />
          30-second setup
        </span>
        <span className="inline-flex items-center gap-2">
          <UsersIcon width={14} height={14} className="text-white" />
          Unlimited users
        </span>
      </div>
    </div>
  );
}
