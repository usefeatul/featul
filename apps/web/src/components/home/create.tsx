import { Container } from "../global/container";
import { Card } from "@featul/ui/components/card";
import { CardAccent, CardTag, AccentBar } from "@featul/ui/components/cardElements";
import { SetupIcon } from "@featul/ui/icons/setup";
import { BoardIcon } from "@featul/ui/icons/board";
import FeatureCard from "./featureCard";
import Image from "next/image";

export default function Create() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section>
        <div className="bg-background py-16 sm:py-24">
          <div className="mx-auto w-full px-1 sm:px-6 max-w-5xl ">
            <div>
              <h2 className="text-foreground mt-4 text-2xl sm:text-3xl lg:text-3xl font-semibold">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 mt-8">
              {/* Workspace setup card */}
              <Card className="relative p-4 sm:p-6 flex flex-col">
                <CardTag />
                <div className="space-y-1 mb-4">
                  <SetupIcon className="size-4 text-primary opacity-100" opacity={1} aria-hidden />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">Create your workspace</h3>
                  <CardAccent>
                    Sign up with email, create your workspace, and publish a board
                    without touching your codebase.
                  </CardAccent>
                </div>
                {/* Two overlapping floating images */}
                <div className="relative flex-1 min-h-[180px] sm:min-h-[220px] mt-auto">
                  <div className="absolute left-0 bottom-0 w-[55%] h-[85%] rounded-lg overflow-hidden border border-border/60 shadow-lg bg-background z-10">
                    <Image
                      src="/image/dashboard.png"
                      alt="Workspace dashboard with request statuses and counts"
                      fill
                      className="object-cover object-left-top"
                    />
                  </div>
                  <div className="absolute right-0 top-0 w-[55%] h-[85%] rounded-lg overflow-hidden border border-border/60 shadow-lg bg-background z-20">
                    <Image
                      src="/image/dashboard.png"
                      alt="Workspace view with sortable customer requests"
                      fill
                      className="object-cover object-right-top"
                    />
                  </div>
                </div>
              </Card>

              {/* Board sharing card */}
              <Card className="relative p-4 sm:p-6 flex flex-col">
                <CardTag />
                <div className="space-y-1 mb-4">
                  <BoardIcon className="size-4 text-primary opacity-100" opacity={1} aria-hidden />
                  <h3 className="text-foreground text-sm sm:text-base font-semibold">Share your board</h3>
                  <CardAccent>
                    Use your workspace subdomain or custom domain to collect votes,
                    comments, and new requests in one place.
                  </CardAccent>
                </div>
                <div className="relative flex-1 min-h-[140px] sm:min-h-[180px] mt-auto rounded-md overflow-hidden border border-border/50 shadow-sm">
                  <Image
                    src="/image/dashboard.png"
                    alt="Public feedback board where users can submit and vote"
                    fill
                    className="object-cover object-center"
                  />
                </div>
              </Card>

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
