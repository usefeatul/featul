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
  },
  {
    number: "02",
    meta: "Subdomain or custom domain",
    title: "Share your board",
    description:
      "Use your workspace subdomain or custom domain to collect votes, comments, and new requests in one place.",
    href: "/docs/branding-setup/domain",
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

          <div className="mt-10 overflow-hidden rounded-md border border-foreground/10 bg-white">
            <div className="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)]">
              <div className="border-b border-foreground/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                <p className="text-primary text-sm font-medium">Quick start</p>
                <div className="mt-6 space-y-8">
                  {setupSteps.map((step, index) => (
                    <div key={step.number}>
                      <div className="flex items-start gap-4">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full border border-foreground/10 bg-foreground/[0.03] text-sm font-semibold tabular-nums text-primary">
                          {step.number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <h3 className="text-foreground text-base font-semibold">
                              {step.title}
                            </h3>
                            <span className="text-accent text-xs">
                              {step.meta}
                            </span>
                          </div>
                          <p className="text-accent mt-2 max-w-xl text-sm leading-6">
                            {step.description}
                          </p>
                          <Link
                            href={step.href}
                            className="text-primary mt-3 inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:text-primary/80"
                          >
                            Learn more
                            <ArrowRight className="size-4" />
                          </Link>
                        </div>
                      </div>
                      {index === 0 ? (
                        <div className="mt-8 border-t border-foreground/10" />
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-foreground/[0.02] p-5 sm:p-6">
                <p className="text-primary text-sm font-medium">
                  Included from day one
                </p>
                <h3 className="text-foreground mt-1 text-lg font-semibold tracking-[-0.02em]">
                  The basics are already handled.
                </h3>
                <div className="mt-6 space-y-4">
                  {essentials.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div
                        key={item.title}
                        className="flex gap-3 rounded-md border border-foreground/10 bg-white p-4"
                      >
                        <Icon
                          className={`mt-0.5 size-8 shrink-0 rounded-md p-1.5 ${item.iconClassName}`}
                        />
                        <div className="min-w-0">
                          <h4 className="text-foreground text-sm font-semibold">
                            {item.title}
                          </h4>
                          <p className="text-accent mt-1 text-sm leading-6">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="border-t border-foreground/10 px-5 py-4 sm:px-6">
              <div className="flex items-start gap-2">
                <AccentBar width={6} />
                <p className="text-accent text-sm leading-6">
                  Seriously, it&apos;s that simple. Most teams collect feedback
                  within minutes of signup.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
