import type { ReactNode } from "react"
import { DocsSidebar } from "./sidebar"

interface DocsLayoutShellProps {
  children: ReactNode
  rightColumn?: ReactNode
}

export function DocsLayoutShell({ children, rightColumn }: DocsLayoutShellProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted">
      <aside className="hidden md:flex w-64 flex-col shrink-0">
        <div className="h-full overflow-y-auto py-8 pl-6 pr-6">
          <DocsSidebar />
        </div>
      </aside>

      <main className="flex-1 bg-background rounded-tl-[2.5rem] shadow-[0_0_0_1px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col relative">
        <div className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-6 py-12 md:px-12 lg:px-16 max-w-[90rem]">
            <div className="flex flex-col xl:flex-row xl:justify-center xl:gap-12">
              {/* Left Spacer for Perfect Centering on large screens */}
              {rightColumn && <div className="hidden 2xl:block w-64 shrink-0" />}
              
              <div className="min-w-0 w-full max-w-3xl">
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
