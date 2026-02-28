"use client";
import { Card } from "@featul/ui/components/card";
import { Container } from "../global/container";
import { UsersIcon } from "@featul/ui/icons/users";
import { SetupIcon } from "@featul/ui/icons/setup";
import { AiIcon } from "@featul/ui/icons/ai";
import { CardAccent, CardTag, AccentBar } from "@featul/ui/components/cardElements";
import Image from "next/image";

export default function FeaturesSection() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section>
        <div className="bg-background py-16 sm:py-24">
          <div className="mx-auto w-full max-w-5xl px-1 sm:px-6">
            <div>
              <h2 className="text-foreground mt-4 text-2xl sm:text-3xl lg:text-3xl font-semibold">
                Everything you need to manage feedback
              </h2>
              <div className="mt-10 flex items-stretch gap-3">
                <AccentBar />
                <p className="text-accent text-sm sm:text-base">
                  From collecting ideas to publishing updates, featul gives you
                  a complete toolkit to listen to your customers.
                </p>
              </div>
            </div>

            <div className="grid gap-3 sm:gap-4 lg:gap-6 md:grid-cols-2 mt-8">
              {/* Feedback Dashboard - Full width hero card */}
              <Card className="relative p-4 sm:p-6 md:p-8 md:col-span-2 flex flex-col">
                <CardTag />
                <div className="space-y-1 mb-4">
                  <AiIcon
                    className="size-4 sm:size-5 text-primary opacity-100"
                    opacity={1}
                    aria-hidden
                  />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">
                    Feedback Dashboard
                  </h3>
                  <CardAccent>
                    Review every request in one place, filter by status and board,
                    and sort by votes to prioritize what to build next.
                  </CardAccent>
                </div>
                <div className="relative flex-1 min-h-[200px] sm:min-h-[280px] md:min-h-[320px] rounded-md overflow-hidden border border-border/50 shadow-sm">
                  <Image
                    src="/image/dashboard.png"
                    alt="Feedback dashboard showing all customer requests organized by status and votes"
                    fill
                    className="object-cover object-top"
                  />
                </div>
              </Card>

              {/* Changelog Card */}
              <Card className="relative p-4 sm:p-6 flex flex-col">
                <CardTag />
                <div className="space-y-1 mb-4">
                  <SetupIcon
                    className="size-4 sm:size-5 text-primary opacity-100"
                    opacity={1}
                    aria-hidden
                  />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">
                    Changelog
                  </h3>
                  <CardAccent>
                    Publish product updates, organize them with tags, and keep
                    customers informed when features ship.
                  </CardAccent>
                </div>
                <div className="relative flex-1 min-h-[140px] sm:min-h-[180px] mt-auto rounded-md overflow-hidden border border-border/50 shadow-sm">
                  <Image
                    src="/image/dashboard.png"
                    alt="Changelog interface showing product updates"
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </Card>

              {/* Public Roadmap Card */}
              <Card className="relative p-4 sm:p-6 flex flex-col">
                <CardTag />
                <div className="space-y-1 mb-4">
                  <UsersIcon
                    className="size-4 sm:size-5 text-primary opacity-100"
                    opacity={1}
                    aria-hidden
                  />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">
                    Public Roadmap
                  </h3>
                  <CardAccent>
                    Share what is planned, in progress, and completed so users can
                    track progress and stay aligned with your roadmap.
                  </CardAccent>
                </div>
                <div className="relative flex-1 min-h-[140px] sm:min-h-[180px] mt-auto rounded-md overflow-hidden border border-border/50 shadow-sm">
                  <Image
                    src="/image/dashboard.png"
                    alt="Public roadmap showing planned, in-progress, and completed features"
                    fill
                    className="object-cover object-right-top"
                  />
                </div>
              </Card>


            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
