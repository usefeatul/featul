import type { ReactNode } from "react"
import { JetBrains_Mono } from "next/font/google"
import { cn } from "@featul/ui/lib/utils"
import {
  MarketingContainer,
  MarketingRail,
  MarketingStack,
} from "@/components/layout/container"

const docsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-docs-code",
})

interface DocsLayoutShellProps {
  children: ReactNode
}

/** Page frame only: like the help center, each docs page lays out its own rails. */
export function DocsLayoutShell({ children }: DocsLayoutShellProps) {
  return (
    <div className={cn(docsMono.variable, "flex flex-1 flex-col")}>
      <MarketingStack className="w-full flex-1">
        <MarketingContainer className="relative z-10 flex flex-1 flex-col pt-28 pb-16 sm:pt-32 sm:pb-20">
          <MarketingRail className="flex flex-1 flex-col">{children}</MarketingRail>
        </MarketingContainer>
      </MarketingStack>
    </div>
  )
}
