import { Container } from "@/components/global/container"
import Sidebar from "@/components/sidebar/Sidebar"
import MobileSidebar from "@/components/sidebar/MobileSidebar"

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <Container className="min-h-screen flex gap-6" maxWidth="8xl">
      <Sidebar />
      <main className="flex-1 pb-20 md:pb-0">{children}</main>
      <MobileSidebar />
    </Container>
  )
}
