import { Container } from "../global/container";
import { UsersIcon } from "@feedgot/ui/icons/users";
import { ChartIcon } from "@feedgot/ui/icons/chart";
import { LoveIcon } from "@feedgot/ui/icons/love";
import { SetupIcon } from "@feedgot/ui/icons/setup";

export default function Listening() {
  return (
    <Container maxWidth="6xl" className="px-6 sm:px-16 lg:px-20 xl:px-24">
      <section className="py-16" data-component="Listening">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <h2 className="text-foreground text-balance text-2xl sm:text-3xl font-bold">
            Build what your users actually need.
            <span className="block mt-1">Listen and act.</span>
          </h2>
          <p className="mt-4 text-accent text-md leading-6 text-balance sm:max-w-4xl">
            Feedgot gives every request a single homecaptured, organized, and
            ready to ship. No more buried DMs, scattered emails, or forgotten
            ideas.
          </p>

          <div className="mt-10 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            <div className="flex flex-col items-start gap-2">
              <LoveIcon
                aria-hidden
                className="size-[30px] text-rose-400 flex-shrink-0"
              />
              <div>
                <h3 className="text-foreground text-base font-medium">
                  Prioritize what users love
                </h3>
                <p className="text-accent mt-1 text-sm leading-6 sm:max-w-[34ch]">
                  Spot ideas with real momentum, not just the loudest voices.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2">
              <ChartIcon
                aria-hidden
                className="size-[30px] text-emerald-400 flex-shrink-0"
              />
              <div>
                <h3 className="text-foreground text-base font-medium">
                  Reduce churn
                </h3>
                <p className="text-accent mt-1 text-sm leading-6 sm:max-w-[34ch]">
                  Show progress on requests so customers stay and engage.
                </p>
              </div>
            </div>


            <div className="flex flex-col items-start gap-2">
              <SetupIcon
                aria-hidden
                className="size-[30px] text-blue-400 flex-shrink-0"
                opacity={1}
              />
              <div>
                <h3 className="text-foreground text-base font-medium">
                  Save hours each week
                </h3>
                <p className="text-accent mt-1 text-sm leading-6 sm:max-w-[34ch]">
                  Stop chasing feedback across docs, spreadsheets, and emails.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-start gap-2">
              <UsersIcon
                aria-hidden
                className="size-[30px] text-violet-600 flex-shrink-0"
              />
              <div>
                <h3 className="text-foreground text-base font-medium">
                  Team aligned
                </h3>
                <p className="text-accent mt-1 text-sm leading-6 sm:max-w-[34ch]">
                  Shared priorities keep everyone focused—no endless debates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}
