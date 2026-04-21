import Link from "next/link";
import { Container } from "../global/container";
import { Card } from "@featul/ui/components/card";
import { AccentBar } from "@featul/ui/components/cardElements";
import FeatureCard from "./featureCard";
import { ArrowRight } from "lucide-react";

const setupCards = [
  {
    title: "Create your workspace",
    description:
      "Sign up with email, choose your workspace, and get your feedback portal live without touching your codebase.",
    href: "/docs/getting-started/index",
    step: "01",
  },
  {
    title: "Share your board",
    description:
      "Use your workspace subdomain or custom domain to collect votes, comments, and new requests in one place.",
    href: "/docs/branding-setup/domain",
    step: "02",
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
                <p className="text-accent text-sm sm:text-base">
                  Create a workspace, launch your board, and start collecting
                  requests in minutes.
                </p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-6">
              {setupCards.map((card) => (
                <Card
                  key={card.title}
                  className="group rounded-md border border-foreground/10 bg-white p-5 shadow-none"
                >
                  <div className="flex items-start gap-4">
                    <span className="text-primary flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/5 text-sm font-semibold">
                      {card.step}
                    </span>
                    <div>
                      <h3 className="text-foreground text-lg font-semibold tracking-[-0.02em] sm:text-xl">
                        {card.title}
                      </h3>
                      <p className="text-accent mt-2 max-w-[46ch] text-sm leading-6 sm:text-base">
                        {card.description}
                      </p>
                      <Link
                        href={card.href}
                        className="text-primary mt-4 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary/80"
                      >
                        Learn more
                        <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            <FeatureCard withinContainer={false} />
            <div className="mt-10 flex items-start gap-2">
              <AccentBar width={8} />
              <p className="text-accent/80 text-sm">
                Seriously, it's that simple. Most teams collect feedback within minutes of signup.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
