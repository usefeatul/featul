import type { ReactNode } from "react"
import { DocsSidebar } from "./Sidebar"
import { DocsMobileNav } from "./MobileNav"

interface DocsLayoutShellProps {
  children: ReactNode
}

export function DocsLayoutShell({ children }: DocsLayoutShellProps) {
  return (
    <div className="fixed inset-0 flex bg-muted">
      {/* Fixed sidebar */}
      <aside className="hidden md:flex w-56 flex-col shrink-0">
        <div className="h-full py-8 pl-6 pr-4 overflow-y-auto">
          <DocsSidebar />
        </div>
      </aside>

      <DocsMobileNav />

      {/* Main content area - only this scrolls */}
      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-1 lg:pt-2 bg-background md:bg-transparent overflow-hidden ">
        <div className="flex-1 bg-background md:rounded-tl-3xl  border border-border shadow-md flex flex-col relative overflow-hidden">
          <div
            className="flex-1 overflow-y-auto"
            data-docs-scroll-container="true"
          >
            <div className="container mx-auto px-6 pt-8 pb-24 md:pb-12 md:px-12 lg:px-16 max-w-[45rem]">
              <div className="flex justify-center">
                <div className="min-w-0 w-full max-w-3xl">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
