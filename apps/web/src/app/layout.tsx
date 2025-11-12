import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { ReactScan } from "@feedgot/ui/global/react-scan";
import { DebugTools } from "@/components/dev/debug-tools";

import { fontsClassName } from "./fonts";
import "./globals.css";
import { SITE_URL, DEFAULT_TITLE, TITLE_TEMPLATE, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS } from "@/config/seo";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";

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
    description:
      "Privacy‑first, EU‑hosted product feedback, public roadmap, and changelog—built for alignment and customer‑driven delivery.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Feedgot",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feedgot",
    description:
      "Privacy‑first, EU‑hosted product feedback, public roadmap, and changelog—built for alignment and customer‑driven delivery.",
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ReactScan />
        <Script
          src="https://cdn.seline.com/seline.js"
          data-token="1eadc8582cdf3ff"
          strategy="afterInteractive"
        />
        <OrganizationJsonLd />
      </head>
      <body className={fontsClassName}>
        {children}
        {/* <DebugTools /> */}
      </body>
    </html>
  );
}
