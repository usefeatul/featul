"use client";
import { Container } from "../global/container";
import { SetupIcon } from "@feedgot/ui/icons/setup";

export default function Setup() {
  return (
    <Container maxWidth="6xl" className="px-6 sm:px-16 lg:px-20 xl:px-24">
      <section className="py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <SetupIcon aria-hidden className="size-5 text-primary mb-2 sm:mb-3" opacity={1} />
          <h2 className="mt-6 text-foreground text-balance text-2xl sm:text-3xl font-semibold">
            Quick setup options
          </h2>

          <div className="mt-4 grid gap-6 sm:grid-cols-2 ">
            <div className="rounded-lg p-0">
              <p className="text-accent text-base sm:text-md tracking-widest leading-7 text-balance">
                Launch a public feedback portal on your own subdomain
                <span className="inline rounded-md bg-primary/50 px-2 py-0 text-black tracking-widest ml-1">
                  feedback.yourbrand.com
                </span>
                or use Feedgot’s hosted space. Customers can browse ideas,
                vote on favorites, and submit new requests. No code required—
                just share the link.
              </p>
            </div>
            <div className="rounded-lg p-0">
              <p className="text-accent text-base sm:text-md tracking-wide leading-7 text-balance">
                Add our in‑app widget with a light snippet
                <span className="inline rounded-md bg-primary/50 px-2 py-0 text-black tracking-widest ml-1">
                  {"<script src=\"...\"></script>"}
                </span>
                so users can submit ideas without leaving. They see your
                roadmap and read changelogs in a beautiful floating widget that
                matches your brand.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Container>
  );
}