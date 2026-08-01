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
  const hasHeader = Boolean(meta || eyebrow || title || description)

  return (
    <main
      className="flex min-h-full flex-1 flex-col overflow-x-clip bg-background"
      data-component={dataComponent}
    >
      {/* Decorative sky only — copy starts below the blur */}
      <SkySection data-component={dataComponent ? `${dataComponent}Sky` : undefined} />

      <div className="relative mx-auto w-full max-w-6xl flex-1">
        <VerticalLines force className="absolute inset-0 z-30" />
        <Container
          maxWidth="6xl"
          className="relative z-10 px-4 pb-12 pt-6 sm:px-10 sm:pt-8 lg:px-12 xl:px-14"
        >
          <div className="w-full max-w-6xl px-0 sm:px-6">
            {hasHeader ? (
              <header
                className={cn(
                  "mb-8 max-w-3xl text-left",
                  // Allow callers to override alignment (e.g. pricing centers the header).
                  headerClassName,
                )}
              >
                {meta}
                {eyebrow ? (
                  <div className="text-sm text-accent">{eyebrow}</div>
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
                  <div
                    className={cn(
                      "mt-4 max-w-2xl text-base text-accent sm:text-lg",
                      headerClassName?.includes("text-center") && "mx-auto",
                    )}
                  >
                    {description}
                  </div>
                ) : null}
              </header>
            ) : null}
            {children}
          </div>
        </Container>
      </div>
    </main>
  )
}
