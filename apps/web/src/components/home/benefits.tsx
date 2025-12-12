import { Container } from "../global/container";
import { UsersIcon } from "@oreilla/ui/icons/users";
import { FreeIcon } from "@oreilla/ui/icons/free";
import { SetupIcon } from "@oreilla/ui/icons/setup";
import { FeatherIcon } from "@oreilla/ui/icons/feather";
import { ShieldIcon } from "@oreilla/ui/icons/shield";
import { SettingIcon } from "@oreilla/ui/icons/setting";
import { BoardIcon } from "@oreilla/ui/icons/board";
import { RoadmapIcon } from "@oreilla/ui/icons/roadmap";
import { ChangelogIcon } from "@oreilla/ui/icons/changelog";

export default function Benefits() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section data-component="Benefits">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <h2 className="text-foreground text-balance text-2xl sm:text-3xl font-semibold text-center">
            Opinionated feedback for customer driven teams
          </h2>

          <div className="mt-6 sm:mt-8 rounded-md border border-foreground/10 bg-white p-5 sm:p-8 shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 auto-rows-fr">
              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <UsersIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Customer centric
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm  leading-7">
                  <p>
                    One inbox for every voice portal, widget, email, support.
                    Spot trends fast, add context, ship what matters.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <FreeIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Fair free plan
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm  leading-7">
                  <p>
                    Start free, stay free. Boards, roadmap, changelog no limits.
                    No trials, no paywalls. Upgrade when you’re ready, not
                    before.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <SetupIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Easy to integrate
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm  leading-7">
                  <p>
                    One snippet, instant feedback. Drop it in, watch the magic.
                    Next.js, React, WordPress, Webflow works everywhere you
                    build.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <FeatherIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Lightweight
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm leading-7">
                  <p>
                    Zero bloat, lightning fast. Your site stays snappy.
                    Lazy-loaded, cached, optimized—Core Web Vitals love us.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <ShieldIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Secure
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm  leading-7">
                  <p>
                    EU-hosted, HTTPS-everywhere, battle-tested endpoints.
                    Role-based access, audit trails your data stays locked down.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <SettingIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Privacy‑first
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm  leading-7">
                  <p>
                    Zero trackers, zero cookies. We collect only what matters.
                    Your data is yours forever we don’t sell, share, or snoop.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <BoardIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Feedback boards
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm  leading-7">
                  <p>
                    Organize chaos tags, status, product areas, crystal clear.
                    Merge duplicates, track real demand, make every vote count.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <RoadmapIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Public roadmap
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm  leading-7">
                  <p>
                    Show the journey planned, building, shipped. No surprises.
                    Auto-link updates back to requests transparency, automated.
                  </p>
                </div>
              </div>

              <div className="flex h-full flex-col">
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1.5">
                    <ChangelogIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">
                    Changelogs
                  </h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-sm  leading-7">
                  <p>
                    Ship it, share it, celebrate it. Auto-notifications keep
                    everyone in sync. Close the loop, build momentum, show
                    progress that matters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
