"use client";
import { useEffect, useState } from "react";
import { Container } from "../global/container";
import Image from "next/image";
import { HeroContent } from "./hero-content";
import { Button } from "@feedgot/ui/components/button";

export function Hero() {
  const [active, setActive] = useState<"dashboard" | "roadmap" | "changelog">(
    "dashboard"
  );

  // Subtle pill highlight that appears briefly and hides after first switch
  const [showPillHint, setShowPillHint] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setShowPillHint(false), 7000);
    return () => clearTimeout(t);
  }, []);
  useEffect(() => {
    if (active !== "dashboard") setShowPillHint(false);
  }, [active]);

  const imageSrc = {
    dashboard: "/image/image.jpeg",
    roadmap: "/bg.png",
    changelog: "/logo.png",
  }[active];

  return (
    <section className="relative overflow-hidden">
      <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-6xl px-0 sm:px-6">
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
                  <div className="relative flex items-center gap-1.5 rounded-xl bg-white/80 backdrop-blur-md ring-1 ring-border/60 shadow-2xl px-2 py-1.5">
                    {showPillHint && (
                      <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-border/60 animate-pulse"></div>
                    )}
                    <div
                      role="group"
                      aria-label="Preview feature"
                      className="relative z-10 inline-flex items-center gap-3"
                    >
                      <Button
                        size="sm"
                        variant="outline"
                        className={`${
                          active === "dashboard"
                            ? "bg-black text-white border border-border shadow-sm"
                            : "bg-transparent text-muted-foreground hover:bg-white/70"
                        } rounded-xl px-2`}
                        onClick={() => setActive("dashboard")}
                        aria-pressed={active === "dashboard"}
                      >
                        Dashboard
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`${
                          active === "roadmap"
                            ? "bg-black text-white border border-border shadow-sm"
                            : "bg-transparent text-muted-foreground hover:bg-white/70"
                        } rounded-xl px-2`}
                        onClick={() => setActive("roadmap")}
                        aria-pressed={active === "roadmap"}
                      >
                        Roadmap
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`${
                          active === "changelog"
                            ? "bg-black text-white border border-border shadow-sm"
                            : "bg-transparent text-muted-foreground hover:bg-white/70"
                        } rounded-xl px-2`}
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

            {/* Subtle ring nudge occurs inside the pill above */}
          </div>
        </div>
      </Container>
    </section>
  );
}
