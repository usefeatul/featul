import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";

export default function CTA() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
          <div className="bg-white p-6 sm:p-8 rounded-lg border border-black/10 ring-1 ring-border/60 ring-offset-1 ring-offset-background transition-all">
            <h2 className="text-foreground max-w-lg sm:max-w-2xl text-balance text-xl sm:text-2xl lg:text-3xl font-medium">
              <span className="text-muted-foreground">Collect and prioritize feedback.</span> <span className="text-zinc-500">Ship what customers want</span>
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-zinc-500">
              Centralize customer input in boards, prioritize with votes, keep roadmaps in sync, and publish changelogs automatically. Built for SaaS teams.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <HotkeyLink
                href="/signup"
                hotkeyHref="https://dashboard.feedgot.com"
                className="w-full sm:w-auto"
              />
              <LiveDemo className="w-full sm:w-auto text-zinc-500" />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}