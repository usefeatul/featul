import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"
import { Container } from "@/components/global/container"

type SkySectionProps = {
  children: ReactNode
  className?: string
  contentClassName?: string
  "data-component"?: string
}

export function SkySection({
  children,
  className,
  contentClassName,
  "data-component": dataComponent,
}: SkySectionProps) {
  return (
    <section
      className={cn(
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden",
        className,
      )}
      data-component={dataComponent}
    >
      {/* Full-bleed sky — tall + top-pinned so the tree line stays cropped out */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[165%] bg-cover bg-[position:center_top] bg-no-repeat"
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      />
      {/* Blend the sky's top edge into the solid navbar color above it */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#0063d2] from-[64px] to-transparent"
      />
      {/* Soft white fog — blurs a white layer so the sky doesn't frost into cyan */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-10 h-36 bg-background blur-2xl sm:h-40"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent from-10% via-background/90 via-60% to-background"
      />

      <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
        <div className={cn("pb-6 pt-14 sm:pb-8 sm:pt-16 md:pb-10", contentClassName)}>
          {children}
        </div>
      </Container>
    </section>
  )
}
