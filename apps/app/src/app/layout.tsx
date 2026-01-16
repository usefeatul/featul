import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Manrope, Sora } from "next/font/google";
import { Providers } from "../components/providers/providers";
import MainThemeProvider from "@/components/global/MainThemeProvider";
import "./globals.css";
import OrganizationJsonLd from "@/components/seo/OrganizationJsonLd";
import { DebugTools } from "@featul/ui/global/debug-tools";
//
import {
  SITE_URL,
  DEFAULT_TITLE,
  TITLE_TEMPLATE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
} from "@/config/seo";
import { buildSoftwareApplicationSchema } from "@/lib/structured-data";

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
    siteName: "featul",
    title: "featul",
    description: DEFAULT_DESCRIPTION,
    images: [{ url: "/logo.png", width: 1200, height: 630, alt: "featul" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "featul",
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
    <html
      lang="en"
      className={`${manrope.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <head>
        <OrganizationJsonLd />
        <Script
          id="software-app-jsonld"
          type="application/ld+json"
          strategy="beforeInteractive"
        >
          {JSON.stringify(buildSoftwareApplicationSchema(SITE_URL))}
        </Script>
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <MainThemeProvider>{children}</MainThemeProvider>
        </Providers>
        {/* <Script
          id="userjot-widget"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html:
              "window.$ujq=window.$ujq||[];window.uj=window.uj||new Proxy({},{get:(_,p)=>(...a)=>window.$ujq.push([p,...a])});document.head.appendChild(Object.assign(document.createElement('script'),{src:'https://cdn.userjot.com/sdk/v2/uj.js',type:'module',async:!0}));window.uj.init('cm9daudvf001drw15p5m6c2bl',{widget:!0,position:'right',theme:'light',trigger:'default'});",
          }}
        /> */}
        {(process.env.NODE_ENV !== "production" ||
          process.env.NEXT_PUBLIC_ENABLE_DEBUG === "true") && <DebugTools />}
      </body>
    </html>
  );
}
