import Link from "next/link";
import { Check, Globe, Users } from "lucide-react";

import { AccentBar } from "@featul/ui/components/cardElements";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { Container } from "../global/container";
import { DomainIcon } from "@featul/ui/icons/domain";
import { CsvIcon } from "@featul/ui/icons/csv";
import { MemberIcon } from "@featul/ui/icons/member";

const essentials = [
  {
    title: "Custom domain and branding",
    description: "Use your domain, logo, colors, and theme.",
    icon: DomainIcon,
    iconClassName: "bg-foreground/5 text-sky-400 ring-1 ring-foreground/10",
  },
  {
    title: "Team roles and invites",
    description: "Invite teammates and collaborate in one workspace.",
    icon: MemberIcon,
    iconClassName: "bg-foreground/5 text-emerald-400 ring-1 ring-foreground/10",
  },
  {
    title: "CSV import and export",
    description: "Move feedback data in or out whenever you need.",
    icon: CsvIcon,
    iconClassName: "bg-foreground/5 text-amber-400 ring-1 ring-foreground/10",
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

          <div className="mt-8 grid gap-4 sm:mt-10 sm:gap-5 lg:grid-cols-2">
            <Link
              href="/docs/getting-started/index"
              className="block min-w-0"
              aria-label="Learn more about creating your workspace"
            >
              <article className={cn(overlayDialogClass, "flex h-full flex-col")}>
                <div className={cn(overlayInnerClass, "mb-2 p-0")}>
                <div className="flex min-h-[240px] items-center justify-center bg-[#4f9df6] p-4 sm:min-h-[360px] sm:p-8">
                  <div className="w-full max-w-[360px] space-y-2.5 sm:space-y-3">
                    <div className="rounded-md border border-black/10 bg-white p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check className="size-4" strokeWidth={2.4} />
                        </span>
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-semibold">
                            Workspace ready
                          </p>
                          <p className="text-accent mt-0.5 text-xs">
                            Boards and roles included
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-black/10 bg-white p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground/5 text-blue-500 ring-1 ring-foreground/10">
                          <Users className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-foreground text-sm font-semibold">
                            Invite your team
                          </p>
                          <p className="text-accent mt-0.5 text-xs">
                            Owners, admins, and members
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div className={cn(overlayInnerClass, "flex flex-1 flex-col px-4 py-3")}>
                  <h3 className="text-foreground text-left text-base font-medium">
                    Create your workspace
                  </h3>
                  <p className="text-accent mt-1 max-w-xl text-left text-sm leading-6">
                    Sign up with email, choose your workspace, and get your
                    feedback portal live without touching your codebase.
                  </p>
                </div>
              </article>
            </Link>

            <Link
              href="/docs/branding-setup/domain"
              className="block min-w-0"
              aria-label="Learn more about sharing your board"
            >
              <article className={cn(overlayDialogClass, "flex h-full flex-col")}>
                <div className={cn(overlayInnerClass, "mb-2 p-0")}>
                <div className="flex min-h-[240px] items-center justify-center bg-[#5ec4a0] p-4 sm:min-h-[360px] sm:p-8">
                  <div className="w-full max-w-[360px] space-y-2.5 sm:space-y-3">
                    <div className="rounded-md border border-black/10 bg-white p-3 sm:p-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-foreground/5 text-emerald-500 ring-1 ring-foreground/10">
                          <Globe className="size-4" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-foreground truncate text-sm font-semibold">
                            feedback.yourbrand.com
                          </p>
                          <p className="text-accent mt-0.5 text-xs">
                            Custom domain connected
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-md border border-black/10 bg-white p-3 sm:p-4">
                      <p className="text-foreground text-sm font-semibold">
                        Public feedback board
                      </p>
                      <p className="text-accent mt-2 text-xs leading-5">
                        Collect votes, comments, and new requests in one place
                        your customers already recognize.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700">
                          Live
                        </span>
                        <span className="rounded-md bg-blue-50 px-2 py-1 text-[11px] font-medium text-blue-700">
                          Branded
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                </div>

                <div className={cn(overlayInnerClass, "flex flex-1 flex-col px-4 py-3")}>
                  <h3 className="text-foreground text-left text-base font-medium">
                    Share your board
                  </h3>
                  <p className="text-accent mt-1 max-w-xl text-left text-sm leading-6">
                    Use your workspace subdomain or custom domain to collect
                    votes, comments, and new requests in one place.
                  </p>
                </div>
              </article>
            </Link>
          </div>

          <div className="mt-8 sm:mt-10">
            <p className="text-primary text-sm font-medium">
              Included from day one
            </p>
            <h3 className="text-foreground mt-1 text-lg font-semibold tracking-[-0.02em]">
              The basics are already handled.
            </h3>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {essentials.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className={cn(overlayDialogClass, "h-full")}
                  >
                    <div
                      className={cn(
                        overlayInnerClass,
                        "flex h-full flex-col px-4 py-3 sm:px-5 sm:py-4",
                      )}
                    >
                    <span
                      className={`inline-flex size-8 items-center justify-center rounded-md p-1.5 ${item.iconClassName}`}
                    >
                      <Icon className="size-4" />
                    </span>
                    <h4 className="text-foreground mt-3 text-sm font-medium">
                      {item.title}
                    </h4>
                    <p className="text-accent mt-1.5 text-sm leading-6">
                      {item.description}
                    </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 flex items-start gap-2">
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
