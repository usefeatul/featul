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
          <h2 className="text-foreground text-balance text-2xl sm:text-3xl lg:text-3xl font-semibold">
            Why organizations choose Feedgot over {alt.name}
          </h2>

          <div className="mt-10 flex items-start gap-2">
            <AccentBar width={8} />
            <p className="text-accent text-sm sm:text-base">
              While {alt.name} provides feedback collection, Feedgot offers a fundamentally different approach prioritizing data sovereignty, rapid implementation, and workflows that adapt to your processes rather than forcing you to adapt to rigid systems.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-10 sm:gap-14 items-start">
            <div className="sm:relative sm:mt-2">
              <div className="flex items-start gap-3">
                <ShieldIcon className="size-4 sm:size-5 text-primary" opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Complete data ownership and compliance
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Maintain complete control over your feedback data with EU hosting and built-in GDPR compliance. Feedgot ensures your data remains portable migrate, self-host, or integrate without losing valuable insights.
                </p>
                <p>
                  Unlike platforms that lock you into proprietary formats, our open export standards protect your investment and give you the freedom to evolve your tech stack without starting from zero.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-8">
              <div className="flex items-start gap-3">
                <SetupIcon className="size-4 sm:size-5 text-primary" opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Enterprise-grade deployment in minutes
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Deploy a branded feedback portal with a single line of code. Pre-configured workflows and tagging eliminate setup complexity start collecting feedback immediately without infrastructure changes.
                </p>
                <p>
                  Traditional enterprise systems require weeks of implementation. Feedgot reverses this paradigm, letting you share hosted spaces instantly while maintaining your existing user experience flow.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-12">
              <div className="flex items-start gap-3">
                <FeatherIcon className="size-4 sm:size-5 text-primary" opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Performance-optimized architecture
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Our lightweight widget loads fast with lazy-loading and intelligent caching. Collect comprehensive feedback without impacting your site's performance or user experience.
                </p>
                <p>
                  Every millisecond matters for conversion rates. Our performance-first approach ensures you gather insights while maintaining the speed that keeps users engaged and satisfied.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-0">
              <div className="flex items-start gap-3">
                <ChartIcon className="size-4 sm:size-5 text-primary"  opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Intuitive workflow design
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Avoid feature bloat with a focused approach. Our unified workflow connects feedback collection, prioritization, and roadmapping in one coherent system no maze of unused configuration options.
                </p>
                <p>
                  Enterprise software should solve problems, not create them. We focus on capabilities that directly improve your team's ability to act on customer feedback efficiently.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-16">
              <div className="flex items-start gap-3">
                <UsersIcon className="size-4 sm:size-5 text-primary" opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Direct access to product expertise
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Skip generic support responses. Communicate directly with our engineering team for actionable solutions based on deep technical understanding, not scripted replies.
                </p>
                <p>
                  Get expert guidance from the team who built the platform. We help you maximize value quickly, whether you're cloud-hosted or self-hosted.
                </p>
              </div>
            </div>

            <div className="sm:relative sm:mt-6">
              <div className="flex items-start gap-3">
                <BookmarkIcon className="size-4 sm:size-5 text-primary"  opacity={1} />
                <h3 className="text-foreground text-base sm:text-lg font-medium">
                  Thoughtful user experience
                </h3>
              </div>
              <div className="text-accent mt-2 text-sm sm:text-base leading-7 space-y-4">
                <p>
                  Built-in accessibility and automatic roadmap-changelog sync eliminate manual coordination. Small efficiencies compound, letting your team focus on strategic decisions rather than administrative tasks.
                </p>
                <p>
                  The details matter from keyboard navigation to consistent spacing. These thoughtful touches make daily work smoother and keep teams focused on outcomes, not tool management.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
