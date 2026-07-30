import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { AccentBar } from "@featul/ui/components/cardElements";
import { Container } from "../global/container";
import { DomainIcon } from "@featul/ui/icons/domain";
import { CsvIcon } from "@featul/ui/icons/csv";
import { MemberIcon } from "@featul/ui/icons/member";

const setupSteps = [
  {
    number: "01",
    meta: "Workspace, boards, roles",
    title: "Create your workspace",
    description:
      "Sign up with email, choose your workspace, and get your feedback portal live without touching your codebase.",
    href: "/docs/getting-started/index",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#4f9df640_0%,transparent_42%),radial-gradient(circle_at_bottom_right,#4f9df622_0%,transparent_38%),linear-gradient(160deg,#eef5ff_0%,#e4edf8_100%)]",
  },
  {
    number: "02",
    meta: "Subdomain or custom domain",
    title: "Share your board",
    description:
      "Use your workspace subdomain or custom domain to collect votes, comments, and new requests in one place.",
    href: "/docs/branding-setup/domain",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#34d39940_0%,transparent_42%),radial-gradient(circle_at_bottom_right,#34d39922_0%,transparent_38%),linear-gradient(160deg,#eefbf4_0%,#e4f2ec_100%)]",
  },
] as const;

const essentials = [
  {
    title: "Custom domain and branding",
    description: "Use your domain, logo, colors, and theme.",
    icon: DomainIcon,
    iconClassName: "border border-sky-200 bg-sky-100 text-sky-600",
  },
  {
    title: "Team roles and invites",
    description: "Invite teammates and collaborate in one workspace.",
    icon: MemberIcon,
    iconClassName:
      "border border-emerald-200 bg-emerald-100 text-emerald-600",
  },
  {
    title: "CSV import and export",
    description: "Move feedback data in or out whenever you need.",
    icon: CsvIcon,
    iconClassName: "border border-amber-200 bg-amber-100 text-amber-600",
  },
] as const;

export default function Create() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="my-10 sm:my-14" data-component="Create">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="max-w-3xl text-left">
            <h2 className="font-heading text-foreground text-2xl font-semibold sm:text-3xl lg:text-3xl">
              Up and running in 30 seconds
            </h2>
            <div className="mt-3 flex items-start gap-2">
              <AccentBar width={8} />
              <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
                Create a workspace, invite your team, and share a branded
                feedback board without adding setup work to your roadmap.
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:gap-4 lg:grid-cols-2">
            {setupSteps.map((step) => (
              <Link
                key={step.number}
                href={step.href}
                className="group block"
                aria-label={`Learn more about ${step.title}`}
              >
                <article className="flex h-full flex-col overflow-hidden rounded-md border border-foreground/10 bg-white transition-[transform,box-shadow,border-color] duration-200 group-hover:-translate-y-0.5 group-hover:border-foreground/15 group-hover:shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
                  <div
                    className={`relative flex min-h-[140px] items-center justify-center overflow-hidden sm:min-h-[156px] ${step.panelClassName}`}
                  >
                    <div
                      aria-hidden
                      className="absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.35)_1px,transparent_1px)] [background-size:22px_22px]"
                    />
                    <span className="absolute left-3 top-3 z-10 inline-flex items-center rounded-md border border-foreground/10 bg-white/85 px-2 py-1 text-[11px] font-medium text-accent backdrop-blur-sm">
                      {step.meta}
                    </span>
                    <div className="relative z-10 flex size-[72px] items-center justify-center rounded-md border border-white/80 bg-white text-xl font-semibold tabular-nums text-primary shadow-[0_10px_28px_rgba(15,23,42,0.12)] transition-transform duration-200 group-hover:scale-[1.03] sm:size-[80px] sm:text-2xl">
                      {step.number}
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col px-4 py-4 sm:px-5 sm:py-5">
                    <h3 className="text-foreground text-lg font-semibold tracking-[-0.02em]">
                      {step.title}
                    </h3>
                    <p className="text-accent mt-2 flex-1 text-sm leading-6">
                      {step.description}
                    </p>
                    <span className="text-primary mt-4 inline-flex items-center gap-1.5 text-sm font-medium transition-colors group-hover:text-primary/80">
                      Learn more
                      <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div className="mt-8 sm:mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-primary text-sm font-medium">
                  Included from day one
                </p>
                <h3 className="text-foreground mt-1 text-lg font-semibold tracking-[-0.02em]">
                  The basics are already handled.
                </h3>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3 sm:gap-4">
              {essentials.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-md border border-foreground/10 bg-white p-4 transition-colors hover:border-foreground/15"
                  >
                    <Icon
                      className={`size-9 rounded-md p-1.5 ${item.iconClassName}`}
                    />
                    <h4 className="text-foreground mt-3 text-sm font-semibold">
                      {item.title}
                    </h4>
                    <p className="text-accent mt-1.5 text-sm leading-6">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-2 sm:mt-8">
            <AccentBar width={6} />
            <p className="text-accent text-sm leading-6">
              Seriously, it&apos;s that simple. Most teams collect feedback
              within minutes of signup.
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}
