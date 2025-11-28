"use client";
import { Container } from "../global/container";
import { SetupIcon } from "@feedgot/ui/icons/setup";

export default function Setup() {
  return (
    <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
      <section className="" data-component="Setup">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <SetupIcon aria-hidden className="size-5 text-primary mb-2 sm:mb-3" opacity={1} />
          <h2 className="mt-6 text-foreground text-balance text-2xl sm:text-3xl font-semibold">
            Set up in minutes
          </h2>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                  <SetupIcon aria-hidden className="size-4" opacity={1} />
                </span>
                <div>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Launch a feedback portal</h3>
                  <p className="text-accent mt-1 text-sm sm:text-base leading-7 text-balance sm:max-w-[60ch]">
                    Launch a public feedback portal on your own subdomain
                    <span className="inline rounded-md bg-primary/50 px-2 py-0 text-black tracking-widest ml-1">
                      feedback.yourbrand.com
                    </span>
                    or use Feedgot’s hosted space. Customers can browse ideas, vote on favorites, and submit new requests. No code required—just share the link.
                  </p>
                </div>
              </div>
            </div>

            <div className="group relative rounded-md border border-foreground/10 bg-white p-5 sm:p-6 transition-shadow hover:shadow-sm">
              <div className="flex items-start gap-3">
                <span className="inline-flex size-7 sm:size-8 items-center justify-center rounded-md bg-foreground/5 text-primary ring-1 ring-foreground/10 p-1 sm:p-1.5">
                  <SetupIcon aria-hidden className="size-4" opacity={1} />
                </span>
                <div>
                  <h3 className="text-foreground text-base sm:text-lg font-medium">Add the in‑app widget</h3>
                  <p className="text-accent mt-1 text-sm sm:text-base leading-7 text-balance sm:max-w-[60ch]">
                    Add our in‑app widget with a light snippet
                    <span className="inline rounded-md bg-primary/50 px-2 py-0 text-black tracking-widest ml-1">
                      {"<script src=\"...\"></script>"}
                    </span>
                    so users can submit ideas without leaving. They see your roadmap and read changelogs in a beautiful floating widget that matches your brand.
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