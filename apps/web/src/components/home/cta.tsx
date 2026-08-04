import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";

export default function CTA() {
  return (
    <section className="relative mb-0 mt-6 bg-background pb-10 pt-4 sm:mt-8 sm:pb-12 sm:pt-6" data-component="CTA">
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div
            className="overflow-hidden rounded-md border border-black/10 bg-white bg-cover bg-center bg-no-repeat p-6 text-left ring-offset-background transition-all sm:p-8"
            style={{ backgroundImage: "url(/image/sky.PNG)" }}
          >
            <h2 className="font-heading max-w-lg sm:max-w-2xl text-balance text-xl sm:text-2xl lg:text-3xl font-medium text-white">
              <span className="text-white">
                Collect and prioritize feedback.
              </span>{" "}
              <span className="text-white/85">Ship what customers want</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-white/80">
              Centralize customer input in boards, prioritize with votes, keep
              roadmaps in sync, and publish changelogs automatically. Built for
              SaaS teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <HotkeyLink className="w-full sm:w-auto" />
              <LiveDemo className="w-full sm:w-auto border-white/70 bg-white/95 text-accent shadow-sm hover:bg-white" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
