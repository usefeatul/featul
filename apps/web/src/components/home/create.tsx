import Link from "next/link";
import { Container } from "../global/container";
import { Card } from "@featul/ui/components/card";
import { AccentBar } from "@featul/ui/components/cardElements";
import FeatureCard from "./featureCard";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const setupCards = [
  {
    title: "Create your workspace",
    description:
      "Sign up with email, choose your workspace, and get your feedback portal live without touching your codebase.",
    href: "/docs/getting-started/index",
    panelClassName:
      "bg-[radial-gradient(circle_at_top,#f4dcc1_0%,transparent_52%),linear-gradient(135deg,#f7f1e6_0%,#e5e8e1_100%)]",
  },
  {
    title: "Share your board",
    description:
      "Use your workspace subdomain or custom domain to collect votes, comments, and new requests in one place.",
    href: "/docs/branding-setup/domain",
    image: "/image/dashboard.png",
    alt: "Public feedback board where users can submit and vote",
    imageClassName: "object-cover object-center",
    imageFrameClassName: "sm:mr-10",
    panelClassName:
      "bg-[radial-gradient(circle_at_top_left,#efe1c8_0%,transparent_45%),linear-gradient(135deg,#e5e7dc_0%,#d9dfd8_100%)]",
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
                  className="group gap-0 rounded-md border border-foreground/8 bg-white p-3 shadow-none ring-1 ring-black/5"
                >
                  <div
                    className={`relative overflow-hidden rounded-md border border-black/5 ${card.panelClassName}`}
                  >
                    <div className="min-h-[220px] p-4 sm:min-h-[260px] sm:p-5">
                      {card.title === "Create your workspace" ? (
                        <div className="relative h-full">
                          <div className="absolute bottom-0 left-0 h-[84%] w-[58%] overflow-hidden rounded-md border border-white/70 bg-white">
                            <Image
                              src="/image/dashboard.png"
                              alt="Workspace dashboard with request statuses and counts"
                              fill
                              sizes="(max-width: 640px) 55vw, (max-width: 1024px) 28vw, 320px"
                              className="object-cover object-left-top"
                            />
                          </div>
                          <div className="absolute right-0 top-0 h-[84%] w-[58%] overflow-hidden rounded-md border border-white/70 bg-white">
                            <Image
                              src="/image/dashboard.png"
                              alt="Workspace view with sortable customer requests"
                              fill
                              sizes="(max-width: 640px) 55vw, (max-width: 1024px) 28vw, 320px"
                              className="object-cover object-right-top"
                            />
                          </div>
                        </div>
                      ) : (
                        <div
                          className={`relative h-full overflow-hidden rounded-md border border-white/70 bg-white ${card.imageFrameClassName}`}
                        >
                          <Image
                            src={card.image}
                            alt={card.alt}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 420px"
                            className={card.imageClassName}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="px-2 pb-3 pt-5 sm:px-3">
                    <h3 className="text-foreground text-xl font-semibold tracking-[-0.02em]">
                      {card.title}
                    </h3>
                    <p className="text-accent mt-3 max-w-[46ch] text-sm leading-6 sm:text-base">
                      {card.description}
                    </p>
                    <Link
                      href={card.href}
                      className="text-primary mt-5 inline-flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary/80"
                    >
                      Learn more
                      <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                    </Link>
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
