import { Container } from "../global/container";
import { HotkeyLink } from "../global/hotkey-link";
import { LiveDemo } from "../global/live-demo";

export default function CTA() {
  return (
    <section className="bg-background py-12 sm:py-16">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-6xl">
          <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md border border-black/10 ring-1 ring-border/60 ring-offset-1 ring-offset-background transition-all">
            <h2 className="text-foreground max-w-lg sm:max-w-2xl text-balance text-2xl sm:text-3xl lg:text-4xl font-semibold">
              <span className="text-muted-foreground">Build Modern Websites.</span> Drive Results
            </h2>
            <p className="mt-4 max-w-2xl text-base sm:text-lg text-zinc-500">
              Libero sapiente aliquam quibusdam aspernatur, praesentium iusto repellendus.
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