import type { ReactNode } from "react"
import { DocsSidebar } from "./sidebar"
import { DocsMobileNav } from "./mobile-nav"

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
      <aside className="hidden md:flex w-64 flex-col shrink-0">
        <div className="sticky top-0 h-screen py-8 pl-6 pr-6">
          <DocsSidebar />
        </div>
      </aside>

      <DocsMobileNav />

      <main className="flex-1 flex flex-col min-w-0 pt-8 md:pt-1 lg:pt-2 min-h-0">
        <div className="flex-1 min-h-0 bg-background md:rounded-tl-2xl shadow-[0_0_0_1px_rgba(0,0,0,0.05)] flex flex-col relative">
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
        <aside className="hidden xl:block pointer-events-none fixed top-16 right-4 sm:right-6 lg:right-10 2xl:right-16 z-20">
          <div className="w-64 max-w-xs pointer-events-auto">
            {rightColumn}
          </div>
        </aside>
      )}
    </div>
  )
}
