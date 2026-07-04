"use client";

import { useState } from "react";
import Image from "next/image";
import { Container } from "../global/container";
import { HeroContent } from "./hero-content";
import { HeroBackground } from "./hero-background";
import { BrowserFrame } from "./browser-frame";
import { PreviewSwitchPill } from "@/components/home/preview-switch";
import { usePreviewHint } from "../../hooks/usePreviewHint";

const PREVIEW_WIDTH = 1762;
const PREVIEW_HEIGHT = 1124;

export function Hero() {
  const [active, setActive] = useState<"dashboard" | "roadmap" | "changelog">(
    "dashboard"
  );

  const showPillHint = usePreviewHint();

  const imageSrc = {
    dashboard: "/image/dashboard.png",
    roadmap: "/image/roadmap.png",
    changelog: "/image/changelog.png",
  }[active];

  return (
    <section
      className="relative isolate z-[45] -mt-16 overflow-hidden pt-16 pb-10 sm:pb-14"
      data-component="Hero"
    >
      <HeroBackground />

      <Container
        maxWidth="6xl"
        className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className="pt-28 pb-6 sm:pt-36 sm:pb-10 md:pt-44 lg:pt-48">
            <HeroContent variant="overlay" />
          </div>

          <div className="relative mx-auto max-w-5xl">
            <BrowserFrame url="app.featul.com">
              <div
                className="relative w-full bg-card"
                style={{ aspectRatio: `${PREVIEW_WIDTH} / ${PREVIEW_HEIGHT}` }}
              >
                <Image
                  src={imageSrc}
                  alt={`featul ${active} preview – product dashboard screenshot showing feedback management interface`}
                  fill
                  priority
                  quality={100}
                  sizes={`(max-width: 1280px) 100vw, ${PREVIEW_WIDTH}px`}
                  className="object-contain object-top"
                />
              </div>
            </BrowserFrame>
            <PreviewSwitchPill
              active={active}
              onChange={setActive}
              showHint={showPillHint}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
