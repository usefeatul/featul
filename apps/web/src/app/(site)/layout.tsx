import Navbar from "@/components/home/navbar"
import Footer from "@/components/home/footer"
// import AnnouncementBanner from "@/components/home/banner"
import MarketingConsentManager from "@/components/legal/consent"
import { MarketingEdgePattern } from "@/components/layout/edge-pattern"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MarketingConsentManager>
      <MarketingEdgePattern />
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* <AnnouncementBanner /> */}
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </div>
    </MarketingConsentManager>
  )
}
