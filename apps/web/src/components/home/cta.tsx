import Image from "next/image";
import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";

export default function CTA() {
  return (
    <section className="relative my-6 sm:my-8" data-component="CTA">
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="relative min-h-[360px] overflow-hidden rounded-md sm:min-h-[420px]">
            <Image
              src="/image/herosky.png"
              alt=""
              fill
              quality={100}
              sizes="(max-width: 1280px) 100vw, 1152px"
              className="object-cover object-[center_30%]"
            />

            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,oklch(0.45_0.14_238_/_0.35)_100%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_100%,rgba(255,255,255,0.18)_0%,transparent_70%)]" />

            <div
              className="absolute -bottom-10 -left-12 h-48 w-64 rounded-full opacity-35 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.82 0.12 350 / 0.4) 0%, transparent 70%)",
              }}
            />
            <div
              className="absolute -bottom-8 -right-10 h-52 w-72 rounded-full opacity-30 blur-3xl"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.78 0.14 145 / 0.35) 0%, transparent 70%)",
              }}
            />

            <div className="relative z-10 flex h-full min-h-[360px] flex-col items-center justify-center px-6 py-14 text-center sm:min-h-[420px] sm:px-10 sm:py-16">
              <h2 className="max-w-3xl text-balance font-heading text-2xl font-semibold leading-tight text-white sm:text-3xl lg:text-4xl">
                Collect and prioritize feedback.{" "}
                <span className="inline-flex rounded-md bg-white/20 px-2 py-[2px] align-baseline">
                  Ship what customers want
                </span>
              </h2>
              <p className="mt-5 max-w-2xl text-sm leading-relaxed text-balance text-white/85 sm:text-base md:text-lg">
                Centralize customer input in boards, prioritize with votes, keep
                roadmaps in sync, and publish changelogs automatically. Built for
                SaaS teams.
              </p>
              <div className="mt-8 flex w-full max-w-md flex-col items-stretch gap-3 sm:max-w-none sm:flex-row sm:items-stretch sm:justify-center sm:gap-4">
                <HotkeyLink
                  className="w-full sm:w-auto"
                  label="Add to your website"
                />
                <LiveDemo overlay className="w-full sm:w-auto" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
