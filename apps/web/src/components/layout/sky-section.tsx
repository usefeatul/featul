import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"
import { Container } from "@/components/global/container"

type SkySectionProps = {
  children?: ReactNode
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
  const hasContent = children != null && children !== false

  return (
    <section
      className={cn(
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden",
        !hasContent && "h-[20vh] min-h-[8.5rem]",
        className,
      )}
      data-component={dataComponent}
    >
      {/* Full-bleed sky — tall + top-pinned so the tree line stays cropped out */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[180%] bg-cover bg-[position:center_top] bg-no-repeat"
        style={{ backgroundImage: "url(/image/sky.PNG)" }}
      />
      {/* Blend the sky's top edge into the solid navbar color above it */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0063d2] from-[48px] to-transparent"
      />
      {/* Soft white fog into the page background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-6 h-16 bg-background blur-xl sm:h-20"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-b from-transparent to-background sm:h-12"
      />

      {hasContent ? (
        <Container maxWidth="6xl" className="relative z-10 px-4 sm:px-10 lg:px-12 xl:px-14">
          <div className={cn("pb-6 pt-14 sm:pb-8 sm:pt-16 md:pb-10", contentClassName)}>
            {children}
          </div>
        </Container>
      ) : null}
    </section>
  )
}
