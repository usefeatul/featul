import type { ReactNode } from "react"
import { JetBrains_Mono } from "next/font/google"
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
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
    <div className={cn(docsMono.variable, "fixed inset-0 flex bg-muted")}>
      <aside className="hidden w-56 shrink-0 flex-col lg:flex">
        <div className="h-full overflow-y-auto py-8 pr-4 pl-6 scrollbar-hide">
          <DocsSidebar />
        </div>
      </aside>

      <DocsMobileNav />

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-background pt-14 lg:bg-transparent lg:p-2 lg:pt-2">
        <div
          className={cn(
            overlayDialogClass,
            "relative flex min-h-0 flex-1 flex-col",
            "max-lg:rounded-none max-lg:border-0 max-lg:bg-background max-lg:p-0",
          )}
        >
          <div
            className={cn(
              overlayInnerClass,
              "relative flex min-h-0 flex-1 flex-col",
              "max-lg:rounded-none max-lg:ring-0 max-lg:ring-offset-0",
            )}
          >
            <div
              className="flex-1 overflow-y-auto"
              data-docs-scroll-container="true"
            >
              <div className="container mx-auto max-w-[45rem] px-6 pt-8 pb-24 lg:px-12 lg:pb-12 xl:px-16">
                <div className="flex justify-center">
                  <div className="min-w-0 w-full max-w-3xl">{children}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
