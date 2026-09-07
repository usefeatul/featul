import { MarketingContainer } from "@/components/layout/container";
import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"

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
        "relative overflow-hidden",
        !hasContent && "h-[20vh] min-h-[8.5rem]",
        className,
      )}
      data-component={dataComponent}
    >
      {hasContent ? (
        <MarketingContainer className="relative z-10">
          <div className={cn("pb-6 pt-14 sm:pb-8 sm:pt-16 md:pb-10", contentClassName)}>
            {children}
          </div>
        </MarketingContainer>
      ) : null}
    </section>
  )
}
