import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";
import { DotPattern } from "@/components/dot-pattern";

export default function CTA() {
  return (
    <section className="relative bg-background my-6 sm:my-8 py-4 sm:py-6" data-component="CTA">
      {/* <DotPattern className="z-0" /> */}
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="bg-white p-6 sm:p-8 rounded-md  border border-black/10  ring-offset-background transition-all">
            <h2 className="text-foreground max-w-lg sm:max-w-2xl text-balance text-xl sm:text-2xl lg:text-3xl font-medium">
              <span className="text-muted-foreground">
                Collect and prioritize feedback.
              </span>{" "}
              <span className="text-accent/90">Ship what customers want</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-accent/70">
              Centralize customer input in boards, prioritize with votes, keep
              roadmaps in sync, and publish changelogs automatically. Built for
              SaaS teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <HotkeyLink className="w-full sm:w-auto" />
              <LiveDemo className="w-full sm:w-auto text-accent" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
