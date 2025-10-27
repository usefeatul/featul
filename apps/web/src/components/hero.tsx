"use client";
import { useState } from "react";
import { Container } from "./container";
import Image from "next/image";
import { HeroContent } from "./hero-content";
import { Button } from "@feedgot/ui/components/button";

export function Hero() {
  const [active, setActive] = useState<"dashboard" | "roadmap" | "changelog">(
    "dashboard"
  );

  const imageSrc = {
    dashboard: "/image/image.jpeg",
    roadmap: "/bg.png",
    changelog: "/logo.png",
  }[active];

  return (
    <section className="relative overflow-hidden">
      <Container maxWidth="6xl">
        <div className="pt-10 pb-24 sm:pt-16 sm:pb-32">
          <HeroContent />

          {/* Screenshot card */}
          <div className="mt-6 max-w-5xl rounded-sm shadow-black/50 shadow-2xl">
            <div className="relative">
              <div className="relative z-0 aspect-[16/9] w-full overflow-hidden bg-muted rounded-sm shadow-2xl shadow-zinc-950/50 translate-y-[3px]">
                <Image
                  src={imageSrc}
                  alt={`Feedgot ${active} preview`}
                  fill
                  priority
                  className="object-cover"
                />
              </div>

              {/* Full-bleed bottom border + centered pill */}
              <div className="pointer-events-none absolute left-1/2 bottom-[1px] -translate-x-1/2 w-screen z-20">
                <div className="relative">
                  <div className="border-b border-border"></div>
                  {/* Background mask to keep shadow behind the line */}
                  <div className="absolute inset-x-0 -top-[2px] h-[2px] bg-background"></div>
                  {/* Background mask below the line to hide most of the image, leaving a subtle sliver visible */}
                  <div className="absolute inset-x-0 top-[1px] h-[20px] bg-gray-50"></div>
                </div>
                <div className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-30">
                  <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md ring-1 ring-border/60 shadow-2xl px-3 py-2">
                    <div
                      role="group"
                      aria-label="Preview feature"
                      className="inline-flex items-center gap-1"
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`${
                          active === "dashboard"
                            ? "bg-white text-foreground border border-border shadow-sm"
                            : "bg-transparent text-muted-foreground hover:bg-white/70"
                        } rounded-full px-3`}
                        onClick={() => setActive("dashboard")}
                        aria-pressed={active === "dashboard"}
                      >
                        Dashboard
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`${
                          active === "roadmap"
                            ? "bg-white text-foreground border border-border shadow-sm"
                            : "bg-transparent text-muted-foreground hover:bg-white/70"
                        } rounded-full px-3`}
                        onClick={() => setActive("roadmap")}
                        aria-pressed={active === "roadmap"}
                      >
                        Roadmap
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`${
                          active === "changelog"
                            ? "bg-white text-foreground border border-border shadow-sm"
                            : "bg-transparent text-muted-foreground hover:bg-white/70"
                        } rounded-full px-3`}
                        onClick={() => setActive("changelog")}
                        aria-pressed={active === "changelog"}
                      >
                        Changelog
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
