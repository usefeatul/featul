"use client"

import type { ReactNode } from "react"
import { Container } from "@/components/global/container"
import { SkySection } from "@/components/layout/sky-section"
import { VerticalLines } from "@/components/vertical-lines"
import { cn } from "@featul/ui/lib/utils"

type SkyPageShellProps = {
  children: ReactNode
  dataComponent?: string
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  meta?: ReactNode
  headerClassName?: string
}

export function SkyPageShell({
  children,
  dataComponent,
  eyebrow,
  title,
  description,
  meta,
  headerClassName,
}: SkyPageShellProps) {
  return (
    <main
      className="flex min-h-full flex-1 flex-col overflow-x-clip bg-background"
      data-component={dataComponent}
    >
      <SkySection
        className="min-h-[30vh]"
        contentClassName="flex min-h-[30vh] flex-col justify-end pb-8 pt-24 sm:pb-10 sm:pt-28"
      >
        <div className="mx-auto w-full max-w-6xl px-1 sm:px-6">
          <div className={cn("max-w-3xl text-left", headerClassName)}>
            {meta}
            {eyebrow ? (
              <div className="text-sm text-foreground/65">{eyebrow}</div>
            ) : null}
            {title ? (
              <h1
                className={cn(
                  "font-heading text-balance text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl",
                  eyebrow || meta ? "mt-4" : undefined,
                )}
              >
                {title}
              </h1>
            ) : null}
            {description ? (
              <div className="mt-4 max-w-2xl text-base text-foreground/80 sm:text-lg">
                {description}
              </div>
            ) : null}
          </div>
        </div>
      </SkySection>

      <div className="relative mx-auto w-full max-w-6xl flex-1">
        <VerticalLines force className="absolute inset-0 z-30" />
        <Container
          maxWidth="6xl"
          className="relative z-10 px-4 pb-12 pt-2 sm:px-10 lg:px-12 xl:px-14"
        >
          <div className="w-full max-w-6xl px-0 sm:px-6">{children}</div>
        </Container>
      </div>
    </main>
  )
}
