"use client";
import { useState } from "react";
import { Container } from "../global/container";
import Image from "next/image";
import { HeroContent } from "./hero-content";
import { PreviewSwitchPill } from "@/components/home/preview-switch";
import { DotPattern } from "@/components/dot-pattern";
import { usePreviewHint } from "../../hooks/usePreviewHint";

export function Hero() {
  const [active, setActive] = useState<"dashboard" | "roadmap" | "changelog">(
    "dashboard"
  );

  // Subtle pill highlight that appears briefly and hides after first switch
  const showPillHint = usePreviewHint(active);

  const imageSrc = {
    dashboard: "/image/dashboard.png",
    roadmap: "/image/dashboard.png",
    changelog: "/image/dashboard.png",
  }[active];


  return (
    <section className="relative overflow-hidden" data-component="Hero">
      <DotPattern className="z-0" />
      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-12 lg:px-16 xl:px-18">
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="pt-10 pb-24 sm:pt-16 sm:pb-32 mt-8">
            <HeroContent />
            <div className="relative">
              <div className="relative mt-4 z-0 w-full overflow-hidden bg-card rounded-md border border-border shadow-2xl shadow-zinc-950/50 translate-y-[3px] outline-none ring-2 ring-border/60 ring-offset-2 ring-offset-background">
                <Image
                  src={imageSrc}
                  alt={`featul ${active} preview – product dashboard screenshot showing feedback management interface`}
                  width={1200}
                  height={675}
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/bWxs/zMwMDAwMjL+Z2Rk/M/IyPifmZn5PxMT039WVtb/7Ozs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCYn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg=="
                  className="w-full h-auto"
                />
              </div>
              <PreviewSwitchPill active={active} onChange={setActive} showHint={showPillHint} />
            </div>
          </div>

          {/* <Pointer /> */}
        </div>
      </Container>
    </section>
  );
}
