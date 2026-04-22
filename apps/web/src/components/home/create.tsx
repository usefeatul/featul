import Link from "next/link";
import { Container } from "../global/container";
import { AccentBar } from "@featul/ui/components/cardElements";
import { ArrowRight } from "lucide-react";
import { DomainIcon } from "@featul/ui/icons/domain";
import { CsvIcon } from "@featul/ui/icons/csv";
import { MemberIcon } from "@featul/ui/icons/member";

const setupCards = [
  {
    title: "Create your workspace",
    description:
      "Sign up with email, choose your workspace, and get your feedback portal live without touching your codebase.",
    href: "/docs/getting-started/index",
    number: "01",
    meta: "Workspace, boards, roles",
  },
  {
    title: "Share your board",
    description:
      "Use your workspace subdomain or custom domain to collect votes, comments, and new requests in one place.",
    href: "/docs/branding-setup/domain",
    number: "02",
    meta: "Subdomain or custom domain",
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
      <section className="my-6 sm:my-8">
        <div className="bg-background py-4 sm:py-6">
          <div className="mx-auto w-full px-1 sm:px-6 max-w-5xl ">
            <div>
              <h2 className="font-heading text-foreground mt-4 text-2xl sm:text-3xl lg:text-3xl font-semibold">
                Up and running in 30 seconds
              </h2>
              <div className="mt-10 flex items-start gap-2">
                <AccentBar width={8} />
                <p className="text-accent max-w-2xl text-sm leading-6 sm:text-base">
                  Create a workspace, invite your team, and share a branded
                  feedback board without adding setup work to your roadmap.
                </p>
              </div>
            </div>

            <div className="mt-8 rounded-md border border-foreground/10 bg-white">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)]">
                <div className="border-b border-foreground/10 p-5 sm:p-6 lg:border-b-0 lg:border-r">
                  <div className="space-y-6">
                    {setupCards.map((card) => (
                      <div key={card.title} className="pb-1">
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="text-primary text-sm font-semibold tabular-nums">
                            {card.number}
                          </span>
                          <span className="text-accent text-xs">
                            {card.meta}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-foreground text-lg font-semibold tracking-[-0.02em]">
                              {card.title}
                            </h3>
                          </div>
                          <p className="text-accent mt-2 max-w-[54ch] text-sm leading-6 sm:text-base">
                            {card.description}
                          </p>
                          <Link
                            href={card.href}
                            className="text-primary mt-3 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary/80"
                          >
                            Learn more
                            <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex h-full flex-col p-5 sm:p-6">
                  <div>
                    <p className="text-primary text-sm font-medium">
                      Included from day one
                    </p>
                    <h3 className="text-foreground mt-1 text-lg font-semibold">
                      The basics are already handled.
                    </h3>
                  </div>
                  <div className="mt-6 flex flex-1 flex-col justify-between gap-5">
                    {essentials.map((item) => {
                      const Icon = item.icon;

                      return (
                        <div key={item.title} className="flex gap-3">
                          <Icon
                            className={`mt-0.5 size-7 shrink-0 rounded-md p-1.5 ${item.iconClassName}`}
                          />
                          <div>
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
                  <p className="text-accent/80 text-sm">
                    Seriously, it's that simple. Most teams collect feedback within minutes of signup.
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
