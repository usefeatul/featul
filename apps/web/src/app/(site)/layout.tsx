import Navbar from "@/components/home/navbar"
import Footer from "@/components/home/footer"

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}