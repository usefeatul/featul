import type { ReactNode } from "react"
import { DocsSidebar } from "./sidebar"

interface DocsLayoutShellProps {
  children: ReactNode
  rightColumn?: ReactNode
}

export function DocsLayoutShell({ children, rightColumn }: DocsLayoutShellProps) {
  return (
    <div className="flex h-screen bg-muted overflow-hidden">
      <div className="hidden md:flex w-64 flex-col shrink-0">
        <div className="h-full overflow-y-auto py-8 pl-6 pr-4">
          <DocsSidebar />
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 py-2 pr-2 lg:py-3 lg:pr-3">
        <div className="flex-1 bg-background rounded-2xl border border-border/50 shadow-sm overflow-hidden relative flex flex-col">
          <div className="flex-1 overflow-y-auto pt-12 pb-16 px-8 sm:px-12 lg:px-16">
            <div className="mx-auto max-w-6xl flex gap-12">
              <div className="flex-1 min-w-0 max-w-3xl">
                {children}
              </div>
              
              {rightColumn && (
                <aside className="hidden xl:block w-64 shrink-0">
                  <div className="sticky top-0">
                    {rightColumn}
                  </div>
                </aside>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
