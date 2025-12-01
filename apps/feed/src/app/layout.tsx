import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Providers } from "../components/providers/providers";
import "./styles/globals.css";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { DebugTools } from "@feedgot/ui/global/debug-tools";
//
import {
  SITE_URL,
  DEFAULT_TITLE,
  TITLE_TEMPLATE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
} from "@/config/seo";
import { buildSoftwareApplicationSchema } from "@/lib/structured-data";


export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: TITLE_TEMPLATE,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Feedgot",
    title: "Feedgot",
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "Feedgot" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feedgot",
    description: DEFAULT_DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <OrganizationJsonLd />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&family=Sora:wght@400;600;700&display=swap" rel="stylesheet" />
        <Script id="software-app-jsonld" type="application/ld+json" strategy="beforeInteractive">
          {JSON.stringify(buildSoftwareApplicationSchema(SITE_URL))}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
        {/* {((process.env.NODE_ENV !== "production") || process.env.NEXT_PUBLIC_ENABLE_DEBUG === "false") && <DebugTools />} */}
      </body>
    </html>
  );
}
