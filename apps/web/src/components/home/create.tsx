import { Container } from "../global/container";
import { CollectIcon } from "@feedgot/ui/icons/collect";

export default function Create() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-2 sm:px-4">
          <CollectIcon aria-hidden className="size-5 text-primary mb-2 sm:mb-3" />
          <h2 className=" mt-6 text-foreground text-balance text-xl sm:text-2xl font-semibold">
            Up and running in 30 seconds
          </h2>

          <div className="mt-8 flex flex-col sm:flex-row sm:items-stretch gap-8 sm:gap-12">
            {/* Step 1 */}
            <div className="sm:flex-1">
              <span className="inline-flex items-center justify-center size-7 rounded-full bg-blue-600 text-white text-[12px] font-semibold">
                1
              </span>
              <h3 className="mt-4 text-foreground text-lg font-medium">
                Create workspace
              </h3>
              <p className="text-accent mt-2 text-base leading-7 sm:max-w-[60ch]">
                Sign up with just an email. Pick a name. That’s it. No credit
                card, no sales call, no 47‑field form.
              </p>
            </div>


            {/* Step 2 */}
            <div className="sm:flex-1 sm:px-6">
              <span className="inline-flex items-center justify-center size-7 rounded-full bg-purple-600 text-white text-[12px] font-semibold">
                2
              </span>
              <h3 className="mt-4 text-foreground text-lg font-medium">
                Add to your app
              </h3>
              <p className="text-accent mt-2 text-base leading-7 sm:max-w-[60ch]">
                Copy one line of code for the widget, or just share your board
                link. Both work instantly.
              </p>
            </div>


            {/* Step 3 */}
            <div className="sm:flex-1 sm:px-6">
              <span className="inline-flex items-center justify-center size-7 rounded-full bg-green-600 text-white text-[12px] font-semibold">
                3
              </span>
              <h3 className="mt-4 text-foreground text-lg font-medium">
                Watch magic happen
              </h3>
              <p className="text-accent mt-2 text-base leading-7 sm:max-w-[60ch]">
                Users start submitting. Votes pile up. You ship features. Users
                get notified. Churn drops.
              </p>
            </div>
          </div>

          <div className="mt-10 flex items-start gap-3">
            <div className="h-5 w-[4px] bg-primary rounded-full" aria-hidden />
            <p className="text-accent text-sm sm:text-base">
              Seriously, it’s that simple. Our average customer is collecting feedback within 2 minutes of signing up.
            </p>
          </div>
        </div>
      </section>
    </Container>
  );
}