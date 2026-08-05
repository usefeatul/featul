import Link from "next/link";
import { Container } from "@/components/global/container";
import type { Alternative } from "@/config/alternatives";
import { HotkeyLink } from "@/components/global/hotkey";
import { LiveDemo } from "@/components/global/demo";

type VerdictProps = {
  alt: Alternative;
};

export default function Verdict({ alt }: VerdictProps) {
  const topWin = alt.victoryPoints?.[0]?.toLowerCase() || "privacy-first EU hosting";

  return (
    <Container maxWidth="6xl" className="px-4 sm:px-10 lg:px-12 xl:px-14">
      <section className="py-10 sm:py-14" data-component="AlternativeVerdict">
        <div className="mx-auto w-full max-w-5xl px-0 sm:px-6">
          <div
            className="rounded-md bg-cover bg-center bg-no-repeat p-6 text-left sm:p-8"
            style={{ backgroundImage: "url(/image/sky.PNG)" }}
          >
            <p className="text-sm text-white/85">
              The clear {alt.name} alternative
            </p>

            <h2 className="mt-3 max-w-2xl text-balance font-heading text-xl font-medium text-white sm:text-2xl lg:text-3xl">
              Switch from {alt.name} to Featul — keep the workflow, gain{" "}
              {topWin}.
            </h2>

            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              Boards, roadmaps, and changelogs in one place. Set up in minutes.
            </p>

            <div className="mt-7 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:gap-4">
              <HotkeyLink
                variant="nav"
                label="Try Featul free"
                className="h-10 min-h-[40px] w-full min-w-[40px] border-primary/80 bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground sm:w-auto"
              />
              <LiveDemo className="h-10 min-h-[40px] w-full min-w-[40px] border-white/60 bg-white text-accent hover:bg-white/95 sm:w-auto" />
            </div>

            {alt.website ? (
              <p className="mt-4 text-xs text-white/65">
                Still evaluating?{" "}
                <Link
                  href={alt.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-white"
                >
                  Visit {alt.name}
                </Link>
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </Container>
  );
}
