"use client";

import { Container } from "@/components/global/container";
import { Card } from "@featul/ui/components/card";
import Image from "next/image";
import type { Alternative } from "@/config/alternatives";
import { AlternativeHeroContent } from "./hero-content";
import { getAltDescription } from "@/types/descriptions";

export function AlternativeHero({ alt }: { alt: Alternative }) {
  const imageSrc = "/image/dashboard.png";

  return (
    <section className="bg-background py-10 sm:py-24">
      <Container maxWidth="6xl" className="px-4 sm:px-12 lg:px-16 xl:px-18">
        <div className="mx-auto w-full max-w-7xl px-0 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            <div className="order-last lg:order-last hidden sm:block">
              <Card className="relative p-1 sm:p-2 rotate-1 hover:rotate-0 transition-transform duration-500 ease-in-out">
                <div className="relative z-0 aspect-video w-full overflow-hidden rounded-md bg-muted ring-1 ring-border/60">
                  <Image
                    src={imageSrc}
                    alt={`${alt.name} vs featul preview screenshot`}
                    fill
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAGCAYAAAD68A/GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAA40lEQVR4nGNgQAJmVta/bWxs/zMwMDAwMjL+Z2Rk/M/IyPifmZn5PxMT039WVtb/7Ozs/zk4OP5zcnL+5+Li+s/Nzf2fh4fnPy8v739+fv7/AgIC/4WEhP4LCwv/FxER+S8qKvpfTEzsv7i4+H8JCYn/kpKS/6WkpP5LS0v/l5GR+S8rK/tfTk7uv7y8/H8FBYX/ioqK/5WUlP4rKyv/V1FR+a+qqvpfTU3tv7q6+n8NDY3/mpqa/7W0tP5ra2v/19HR+a+rq/tfT0/vv76+/n8DA4P/hoaG/42Mjf4bGxv/BwB2mFqQvpnLTAAAAABJRU5ErkJggg=="
                    className="object-cover"
                  />
                </div>
              </Card>
            </div>
            <div className="order-first lg:order-first">
              <AlternativeHeroContent
                name={alt.name}
                description={getAltDescription(alt.slug, 'slug-hash')}
                slug={alt.slug}
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}