import type { ReactNode } from "react"
import { DocsSidebar } from "./Sidebar"
import { DocsMobileNav } from "./MobileNav"

/**
 * Props for the DocsLayoutShell component.
 */
interface DocsLayoutShellProps {
  children: ReactNode
  rightColumn?: ReactNode
}

/**
 * Shared layout shell for documentation pages, providing the desktop sidebar,
 * mobile navigation, and optional right-hand column for contextual content.
 */
export function DocsLayoutShell({ children, rightColumn }: DocsLayoutShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <aside className="hidden md:flex w-52 flex-col shrink-0">
        <div className="sticky top-0 h-screen py-8 pl-6 pr-4">
          <DocsSidebar />
        </div>
      </aside>

      <DocsMobileNav />

      <main className="flex-1 flex flex-col min-w-0 pt-14 md:pt-1 lg:pt-2 min-h-0 bg-background md:bg-transparent">
        <div className="flex-1 min-h-0 bg-background md:rounded-tl-2xl shadow-sm ring-1 ring-border/20 flex flex-col relative">
          <div
            className="flex-1 min-h-0 overflow-y-auto"
            data-docs-scroll-container="true"
          >
            <div className="container mx-auto px-6 pt-8 pb-24 md:pb-12 md:px-12 lg:px-16 max-w-[90rem]">
              <div className="flex justify-center">
                <div className="min-w-0 w-full max-w-3xl">{children}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {rightColumn && (
        <aside className="hidden xl:block pointer-events-none fixed top-10 right-1 sm:right-1 lg:right-2 2xl:right-3 z-20">
          <div className="w-64 max-w-xs pointer-events-auto">
            {rightColumn}
          </div>
        </aside>
      )}
    </div>
  )
}
