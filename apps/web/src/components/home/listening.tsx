import { Container } from "../global/container";
import { UsersIcon } from "@feedgot/ui/icons/users";
import { ChartIcon } from "@feedgot/ui/icons/chart";
import { LoveIcon } from "@feedgot/ui/icons/love";
import { SetupIcon } from "@feedgot/ui/icons/setup";

export default function Listening() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <h2 className="text-foreground text-balance text-2xl sm:text-3xl font-semibold">
            Your users are telling you what to build.
            <span className="block mt-1">Are you listening?</span>
          </h2>
          <p className="mt-4 text-zinc-500 text-base leading-7 text-balance sm:max-w-4xl">
            Teams using Feedgot see 40% more feedback submissions because users finally have a place where
            their voice matters. No more scattered emails, lost Slack messages, or ignored feature requests.
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {/* Benefit 1 */}
            <div className="flex flex-col items-start gap-2">
              <LoveIcon aria-hidden className="size-[40px] text-rose-400 flex-shrink-0" />
              <div>
                <h3 className="text-foreground text-base font-semibold">200+ votes on one idea</h3>
                <p className="text-zinc-500 mt-1 text-sm leading-7 sm:max-w-[34ch]">
                  See what users really want, not just who shouts loudest.
                </p>
              </div>
            </div>

            {/* Benefit 2 */}
            <div className="flex flex-col items-start gap-2">
              <ChartIcon aria-hidden className="size-[40px] text-emerald-400 flex-shrink-0" />
              <div>
                <h3 className="text-foreground text-base font-semibold">10% lower churn</h3>
                <p className="text-zinc-500 mt-1 text-sm leading-7 sm:max-w-[34ch]">
                  Users stay when they see you building their requests.
                </p>
              </div>
            </div>

            {/* Benefit 3 */}
            <div className="flex flex-col items-start gap-2">
              <SetupIcon aria-hidden className="size-[40px] text-blue-400 flex-shrink-0" opacity={1} />
              <div>
                <h3 className="text-foreground text-base font-semibold">5 hours/week saved</h3>
                <p className="text-zinc-500 mt-1 text-sm leading-7 sm:max-w-[34ch]">
                  Stop managing feedback in spreadsheets and emails.
                </p>
              </div>
            </div>

            {/* Benefit 4 */}
            <div className="flex flex-col items-start gap-2">
              <UsersIcon aria-hidden className="size-[40px] text-violet-600 flex-shrink-0" />
              <div>
                <h3 className="text-foreground text-base font-semibold">Entire team aligned</h3>
                <p className="text-zinc-500 mt-1 text-sm leading-7 sm:max-w-[34ch]">
                  Everyone sees the same priorities — no more debates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}