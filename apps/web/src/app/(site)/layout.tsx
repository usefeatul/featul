import Navbar from "@/components/home/navbar"
import Footer from "@/components/home/footer"
import { JsonLd } from "@/components/global/seo/json-ld"
import { getOrganizationJsonLd, getWebsiteJsonLd } from "@/config/seo"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd id="website-jsonld" data={getWebsiteJsonLd()} />
      <JsonLd id="organization-jsonld" data={getOrganizationJsonLd()} />
      <Navbar />
      {children}
      <Footer />
    </>
  )
}