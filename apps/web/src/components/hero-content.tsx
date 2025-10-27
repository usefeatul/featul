"use client";

import Link from "next/link";
import { LinkIcon } from "@feedgot/ui/icons/link";
import { Button } from "@feedgot/ui/components/button";
import { FreeIcon } from "@feedgot/ui/icons/free";
import { UsersIcon } from "@feedgot/ui/icons/users";
import { SetupIcon } from "@feedgot/ui/icons/setup";
import { HotkeyLink } from "./hotkey-link";

export function HeroContent() {
  return (
    <div className="max-w-4xl text-left">
      {/* Main heading */}
      <h1 className="text-3xl tracking-tight font-serif font-extrabold text-foreground sm:text-5xl">
        The
        <span className="mx-2 inline-block rounded-md bg-primary/15 px-3 py-1 text-primary">
          simple and joyful
        </span>
        <span className="block mt-2">open-source feedback alternative</span>
      </h1>

      {/* Subtitle */}
      <p className="mt-6 max-w-xl text-md leading-7 font-lighter text-zinc-500 sm:text-md">
        Feedgot is a complete SaaS feedback platform featuring organized
        feedback boards, auto-syncing roadmaps, self-writing changelogs, and
        automated engagement loops
      </p>

      {/* CTAs */}
      <div className="mt-8 flex flex-col items-start justify-start gap-4 sm:flex-row sm:gap-6">
        <HotkeyLink href="/signup" hotkeyHref="https://dashboard.feedbot.com">
          Get started Free
        </HotkeyLink>
        <Button asChild variant="outline" size="lg" className="text-gray-500">
          <Link href="/demo">
            View live demo
            <LinkIcon aria-hidden className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Feature highlights row */}
      <div
        className="mt-8 flex items-center gap-6 text-sm text-muted-foreground"
        aria-label="Key highlights"
      >
        <span className="inline-flex items-center gap-2">
          <FreeIcon width={18} height={18} className="text-foreground" />
          Free forever
        </span>
        <span className="inline-flex items-center gap-2">
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
