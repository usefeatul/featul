import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Manrope, Sora } from "next/font/google";
import { DebugTools } from "@oreilla/ui/global/debug-tools";
import "./globals.css";
import { SITE_URL, DEFAULT_TITLE, TITLE_TEMPLATE, DEFAULT_DESCRIPTION, DEFAULT_KEYWORDS } from "@/config/seo";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { buildSiteNavigationSchema, buildSoftwareApplicationSchema } from "@/lib/structured-data";
import { navigationConfig } from "@/config/homeNav";
import { footerNavigationConfig } from "@/config/footerNav";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-jakarta",
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
  variable: "--font-playfair",
});

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
    siteName: "oreilla",
    title: "oreilla",
    description:
      "Privacy‑first, EU‑hosted product feedback, public roadmap, and changelog—built for alignment and customer‑driven delivery.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "oreilla",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "oreilla",
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
    <html lang="en" className={`${manrope.variable} ${sora.variable}`}>
      <head>
        <Script
          src="https://cdn.seline.com/seline.js"
          data-token={process.env.NEXT_PUBLIC_SELINE_TOKEN}
          strategy="afterInteractive"
        />
        <OrganizationJsonLd />
        <Script
          id="site-navigation-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              buildSiteNavigationSchema(
                SITE_URL,
                [
                  { name: "Home", href: "/" },
                  ...navigationConfig.main.filter((i) => ["/pricing", "/blog"].includes(i.href)),
                  ...footerNavigationConfig.groups
                    .flatMap((g) => g.items)
                    .filter((i) => ["/tools", "/definitions", "/alternatives"].includes(i.href)),
                ]
              )
            ),
          }}
        />
        <Script
          id="software-app-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSoftwareApplicationSchema(SITE_URL)) }}
        />
      </head>
      <body>
        {children}
        {((process.env.NODE_ENV !== "production") || process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true") && <DebugTools />}
      </body>
    </html>
  );
}
