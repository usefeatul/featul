import { Container } from "../global/container"
import { UsersIcon } from "@feedgot/ui/icons/users"
import { FreeIcon } from "@feedgot/ui/icons/free"
import { SetupIcon } from "@feedgot/ui/icons/setup"
import { FeatherIcon } from "@feedgot/ui/icons/feather"
import { ShieldIcon } from "@feedgot/ui/icons/shield"
import { SettingIcon } from "@feedgot/ui/icons/setting"
import { BoardIcon } from "@feedgot/ui/icons/board"
import { RoadmapIcon } from "@feedgot/ui/icons/roadmap"
import { ChangelogIcon } from "@feedgot/ui/icons/changelog"

export default function Benefits() {
  return (
    <Container maxWidth="6xl" className="px-6 sm:px-16 lg:px-20 xl:px-24">
      <section data-component="Benefits">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-foreground text-balance text-2xl sm:text-3xl font-semibold">
            Opinionated feedback for customer‑driven teams
          </h2>

          <div className="mt-6 sm:mt-8 rounded-2xl border border-foreground/10 bg-white p-5 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <UsersIcon aria-hidden className="size-4" />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Customer‑centric</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>Unify feedback from your portal, in‑app widget, email, and support.</p>
                  <p>See trending requests, attach context, and turn signals into planned work.</p>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <FreeIcon aria-hidden className="size-4" />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Fair free plan</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>Launch with core features—boards, roadmap, and changelog included.</p>
                  <p>No trials or paywalls at signup. Upgrade only when you outgrow free.</p>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <SetupIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Easy to integrate</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>Drop in a lightweight snippet to collect feedback directly in your app.</p>
                  <p>Works with popular stacks like Next.js and React, plus WordPress and Webflow.</p>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <FeatherIcon aria-hidden className="size-4" />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Lightweight</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>Loads fast, stays responsive, and keeps Core Web Vitals healthy.</p>
                  <p>Lazy‑loaded assets and caching ensure minimal impact on page speed.</p>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <ShieldIcon aria-hidden className="size-4" opacity={1} />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Secure</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>EU‑based hosting with https across the stack and hardened endpoints.</p>
                  <p>Role‑based access controls keep internal discussions safe and audited.</p>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <SettingIcon className="size-4" />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Privacy‑first</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>No third‑party cookies or trackers. We minimize data collection.</p>
                  <p>Your workspace data stays yours—we don’t sell or share with third parties.</p>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <BoardIcon aria-hidden className="size-4" />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Feedback boards</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>Group ideas by product area, tags, or status to keep things clear.</p>
                  <p>Deduplicate similar requests and merge context so votes reflect real demand.</p>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <RoadmapIcon aria-hidden className="size-4" />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Public roadmap</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>Share clear statuses—planned, in progress, shipped—so expectations stay aligned.</p>
                  <p>Auto‑link updates to original requests to show progress transparently.</p>
                </div>
              </div>

              <div>
                <div className="flex items-start gap-3">
                  <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                    <ChangelogIcon aria-hidden className="size-4" />
                  </span>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Changelogs</h3>
                </div>
                <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-3">
                  <p>Publish clean release notes and notify followers automatically.</p>
                  <p>Keep momentum by closing the loop and celebrating shipped work.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  )
}