import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { AccentBar } from "@/components/home/cardElements";
import { ShieldIcon } from "@feedgot/ui/icons/shield";
import { SetupIcon } from "@feedgot/ui/icons/setup";
import { FeatherIcon } from "@feedgot/ui/icons/feather";
import { ChartIcon } from "@feedgot/ui/icons/chart";
import { UsersIcon } from "@feedgot/ui/icons/users";
import { BookmarkIcon } from "@feedgot/ui/icons/bookmark";

export default function WhyBetter({ alt }: { alt: Alternative }) {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section className="py-16" data-component="WhyBetter">
        <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
          <h2 className="text-foreground text-balance text-3xl sm:text-4xl font-semibold">
            What makes Feedgot different
          </h2>

          <div className="mt-10 flex items-start gap-2">
            <AccentBar width={8} />
            <p className="text-accent text-sm sm:text-base">
              If you’re comparing {alt.name} with Feedgot, here’s how Feedgot’s
              focus on privacy, speed, and a unified workflow changes day‑to‑day
              work.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 items-start">
            <div className="sm:relative sm:mt-2">
              <div className="flex items-start gap-3">
                <ShieldIcon className="size-4 sm:size-5 text-primary" opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Own your feedback
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Keep control over where data lives with EU hosting options and
                  practical GDPR defaults. Teams get clarity on compliance
                  without juggling extra tools.
                </p>
                <p>
                  Data export stays straightforward and portable, so switching
                  or self‑hosting later doesn’t mean starting from zero.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-8">
              <div className="flex items-start gap-3">
                <SetupIcon className="size-4 sm:size-5 text-primary" opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Start in minutes
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Share a hosted space right away or drop in the widget with a
                  single snippet. Configuration is simple—statuses, tags, and
                  branding are ready out of the box.
                </p>
                <p>
                  Collect feedback where users already are, without redirect
                  loops or complex setup guides.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-12">
              <div className="flex items-start gap-3">
                <FeatherIcon className="size-4 sm:size-5 text-primary" opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Tiny footprint
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  The widget loads fast and plays nicely with performance
                  budgets. Assets are lazy‑loaded and cached so pages stay
                  snappy.
                </p>
                <p>
                  Keep UX smooth while still gathering the context you need to
                  prioritize confidently.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-0">
              <div className="flex items-start gap-3">
                <ChartIcon className="size-4 sm:size-5 text-primary"  opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Clear over complex
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Boards, votes, statuses, roadmaps, and release notes—no maze
                  of features. Feedgot favors signal and ship‑ability over
                  configuration sprawl.
                </p>
                <p>
                  You get a single flow from idea to shipped change, visible to
                  your users at each step.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-16">
              <div className="flex items-start gap-3">
                <UsersIcon className="size-4 sm:size-5 text-primary" opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Human support
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Talk to the builders. We keep answers short, practical, and
                  focused on helping you ship. Documentation stays concise, and
                  examples map to common SaaS workflows.
                </p>
                <p>
                  Self‑hosting or cloud—either way, you won’t be left waiting
                  for a forum reply.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-6">
              <div className="flex items-start gap-3">
                <BookmarkIcon className="size-4 sm:size-5 text-primary"  opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Details that add up
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Keyboard‑friendly triage, consistent spacing, and accessible
                  components reduce friction. Roadmap and changelog stay in sync
                  without manual back‑and‑forth.
                </p>
                <p>
                  Small touches make everyday work calmer and keep your team
                  focused on outcomes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
