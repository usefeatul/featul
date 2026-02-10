"use client"

import type { ReactNode } from "react"
import { cn } from "@featul/ui/lib/utils"

type SubdomainListHeaderProps = {
  title?: string
  sidebarPosition?: "left" | "right"
  mobileActions?: ReactNode
  mobileSecondary?: ReactNode
  desktopSecondary?: ReactNode
  mobileTitlePosition?: "top" | "bottom"
  breakpoint?: "md" | "lg"
  className?: string
}

export function SubdomainListHeader({
  title,
  sidebarPosition = "right",
  mobileActions,
  mobileSecondary,
  desktopSecondary,
  mobileTitlePosition = "top",
  breakpoint = "md",
  className,
}: SubdomainListHeaderProps) {
  const align = sidebarPosition === "left" ? "justify-end text-right" : "justify-start text-left"
  const showMobileControls = Boolean(mobileActions) || Boolean(mobileSecondary)
  const titleFirst = mobileTitlePosition === "top"
  const hideUp = breakpoint === "lg" ? "lg:hidden" : "md:hidden"
  const showUp = breakpoint === "lg" ? "hidden lg:flex" : "hidden md:flex"
  const mobileActionsNode = mobileActions ? (
    <span className="inline-flex items-center gap-2">{mobileActions}</span>
  ) : null

  return (
    <div className={cn("mb-4", className)}>
      {title ? (
        <div className={cn(showUp, "items-center mb-5", align)}>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
      ) : null}

      <div className={cn(hideUp)}>
        {title && titleFirst ? (
          <div className={cn("flex items-center", align)}>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        ) : null}

        {showMobileControls ? (
          <div
            className={cn(
              "flex items-center justify-between gap-2",
              title && titleFirst ? "mt-2" : ""
            )}
          >
            {sidebarPosition === "left" ? (
              <>
                {mobileActionsNode}
                {mobileSecondary}
              </>
            ) : (
              <>
                {mobileSecondary}
                {mobileActionsNode}
              </>
            )}
          </div>
        ) : null}

        {title && !titleFirst ? (
          <div className={cn("mt-2 flex items-center", align)}>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        ) : null}
      </div>

      {desktopSecondary ? (
        <div className={cn(showUp, "items-center", align)}>{desktopSecondary}</div>
      ) : null}
    </div>
  )
}
