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
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden bg-background",
        !hasContent && "h-[20vh] min-h-[8.5rem]",
        className,
      )}
      data-component={dataComponent}
    >
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
