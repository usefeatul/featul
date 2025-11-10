"use client";
import { useEffect, useState } from "react";
import { Container } from "../global/container";
import Image from "next/image";
import { HeroContent } from "./hero-content";
import { PreviewSwitchPill } from "@/components/home/preview-switch";
import { usePreviewHint } from "../../hooks/usePreviewHint";

export function Hero() {
  const [active, setActive] = useState<"dashboard" | "roadmap" | "changelog">(
    "dashboard"
  );

  // Subtle pill highlight that appears briefly and hides after first switch
  const showPillHint = usePreviewHint(active);

  const imageSrc = {
    dashboard: "/image/image.jpeg",
    roadmap: "/bg.png",
    changelog: "/logo.png",
  }[active];

  return (
    <section className="relative overflow-hidden" data-component="Hero">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="pt-10 pb-24 sm:pt-16 sm:pb-32 mt-8">
            <HeroContent />
            <div className="mt-4 w-full rounded-sm shadow-black shadow-2xl">
              <div className="relative">
              <div className="relative z-0 aspect-[16/9] w-full overflow-hidden bg-muted rounded-sm shadow-2xl shadow-zinc-950/50 translate-y-[3px] outline-none ring-2 ring-border/60 ring-offset-2 ring-offset-background">
                <Image
                  src={imageSrc}
                  alt={`Feedgot ${active} preview`}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              <PreviewSwitchPill active={active} onChange={setActive} showHint={showPillHint} />
              </div>
            </div>

            {/* Subtle ring nudge occurs inside the pill above */}
          </div>
        </div>
      </Container>
    </section>
  );
}
