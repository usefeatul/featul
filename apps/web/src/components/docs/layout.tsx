import type { ReactNode } from "react"
import { JetBrains_Mono } from "next/font/google"
import { cn } from "@featul/ui/lib/utils"
import {
  MarketingContainer,
  MarketingRail,
  MarketingStack,
} from "@/components/layout/container"
import { DocsSidebar } from "./sidebar"
import { DocsMobileNav } from "./nav"

const docsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-docs-code",
})

interface DocsLayoutShellProps {
  children: ReactNode
}

export function DocsLayoutShell({ children }: DocsLayoutShellProps) {
  return (
    <div className={cn(docsMono.variable, "flex flex-1 flex-col")}>
      <MarketingStack className="w-full flex-1">
        <MarketingContainer className="relative z-10 flex-1 pt-28 pb-16 sm:pt-32 sm:pb-20">
          <MarketingRail>
            <div className="grid w-full grid-cols-1 items-start gap-10 lg:grid-cols-[12.5rem_minmax(0,1fr)] lg:gap-12">
              <aside className="hidden lg:block">
                <div className="sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto pr-1 scrollbar-hide">
                  <DocsSidebar />
                </div>
              </aside>
              <div className="min-w-0 w-full">{children}</div>
            </div>
          </MarketingRail>
        </MarketingContainer>
      </MarketingStack>
      <DocsMobileNav />
    </div>
  )
}
