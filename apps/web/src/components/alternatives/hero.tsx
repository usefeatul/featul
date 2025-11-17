"use client";

import { Container } from "@/components/global/container";
import { Card } from "@feedgot/ui/components/card";
import Image from "next/image";
import { Alternative } from "@/config/alternatives";
import { AlternativeHeroContent } from "./hero-content";
import { getAltDescription } from "@/types/descriptions";

// Distinct layout from the main hero: image-right, content-left
// with tighter alignment and a smaller screenshot.
export function AlternativeHero({ alt }: { alt: Alternative }) {
  const imageSrc = "/bg.png";

  return (
    <section className="bg-background py-16 sm:py-24">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <div className="mx-auto w-full max-w-5xl px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 items-center">
            <div className="order-first">
              <AlternativeHeroContent
                name={alt.name}
                description={getAltDescription(alt.slug)}
              />
            </div>
            <div className="order-last">
              <Card className="relative p-2 sm:p-2">
                <div className="flex aspect-video items-center justify-center">
                  <div className="relative z-0 aspect-[4/3] w-full overflow-hidden rounded-md bg-muted ring-1 ring-border/60">
                    <Image
                      src={imageSrc}
                      alt={`${alt.name} vs Feedgot preview screenshot`}
                      fill
                      priority
                      className="object-cover"
                    />
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}