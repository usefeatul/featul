import { AppSidebar } from "@/app/components/sidebar/app-sidebar"
import { SiteHeader } from "@/app/components/sidebar/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@feedgot/ui/components/sidebar"



export default function Page() {
  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                {/* Main dashboard content area with minimal styling */}
                <div className="bg-card text-card-foreground border p-6 min-h-[400px]">
                  <h2 className="text-2xl font-semibold mb-4">Dashboard Content</h2>
                  <p className="text-muted-foreground">
                    This is the main dashboard content area with a clean, minimal design.
                    No rounded corners or shadows for a simple, professional look.
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
