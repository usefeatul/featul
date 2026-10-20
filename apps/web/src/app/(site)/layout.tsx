import Navbar from "@/components/home/navbar";
import Footer from "@/components/home/footer";
import AnnouncementBanner from "@/components/home/banner";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip">
      <AnnouncementBanner />
      <Navbar />
      <div className="flex flex-1 flex-col pt-10">{children}</div>
      <Footer />
    </div>
  );
}
