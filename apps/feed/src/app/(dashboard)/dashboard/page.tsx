import { AppSidebar } from "@/app/components/sidebar/app-sidebar"
import { SiteHeader } from "@/app/components/sidebar/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@feedgot/ui/components/sidebar"
import { Container } from "@/components/container"



export default function Page() {
  return (
    <SidebarProvider
      defaultOpen={true}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 64)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <Container className="flex flex-1 flex-col py-2" maxWidth="5xl">
          {/* Main dashboard content area with ultra-minimal styling */}
          <div className="bg-background text-foreground p-4 min-h-[400px]">
            <h2 className="text-lg font-normal mb-3">Dashboard</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Clean, minimal dashboard interface
            </p>
          </div>
        </Container>
      </SidebarInset>
    </SidebarProvider>
  )
}
