import Navbar from "@/components/home/navbar"
import Footer from "@/components/home/footer"
import AnnouncementBanner from "@/components/home/announcement-banner"
import MarketingConsentManager from "@/components/legal/marketing-consent-manager"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <MarketingConsentManager>
      <div className="flex min-h-screen flex-col pt-10">
        <AnnouncementBanner />
        <Navbar />
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </MarketingConsentManager>
  )
}
