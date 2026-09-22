import Navbar from "@/components/home/navbar"
import Footer from "@/components/home/footer"
// import AnnouncementBanner from "@/components/home/banner"
import MarketingConsentManager from "@/components/legal/consent"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MarketingConsentManager>
      <div className="flex min-h-screen flex-col overflow-x-clip">
        {/* <AnnouncementBanner /> */}
        <Navbar />
        <div className="flex flex-1 flex-col">{children}</div>
        <Footer />
      </div>
    </MarketingConsentManager>
  )
}
