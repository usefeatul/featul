import type { Metadata, Viewport } from "next";
import { Manrope, Sora } from "next/font/google";
import { DebugTools } from "@featul/ui/global/debug-tools";
import Script from "next/script";
import "./globals.css";
import {
  SITE_URL,
  DEFAULT_TITLE,
  TITLE_TEMPLATE,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
} from "@/config/seo";
import OrganizationJsonLd from "@/components/seo/organization";
import {
  buildSiteNavigationSchema,
  buildSoftwareApplicationSchema,
  buildWebSiteSchema,
} from "@/lib/schema";
import { navigationConfig } from "@/config/homeNav";
import { footerNavigationConfig } from "@/config/footerNav";
import { serializeJsonLd } from "@/lib/security";

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
  alternates: {
    types: {
      "text/markdown": "/index.md",
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/`,
    siteName: "Featul",
    title: "Featul",
    description:
      "Privacy‑first, EU‑hosted product feedback, public roadmap, and changelog—built for alignment and customer‑driven delivery.",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Featul",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Featul",
    description:
      "Privacy‑first, EU‑hosted product feedback, public roadmap, and changelog—built for alignment and customer‑driven delivery.",
    images: ["/og.png"],
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
    icon: [{ url: "/favicon.svg?v=3", type: "image/svg+xml" }],
    shortcut: "/favicon-96x96.png",
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
  const selineToken = process.env.NEXT_PUBLIC_SELINE_TOKEN?.trim();

  return (
    <html
      lang="en"
      className={`${manrope.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          id="home-scroll-memory"
          dangerouslySetInnerHTML={{
            __html: `(function(){if(location.pathname!=="/")return;history.scrollRestoration="manual";var nav=performance.getEntriesByType("navigation")[0];var reload=nav&&(nav.type==="reload"||nav.type==="back_forward");var y=0;try{y=parseInt(sessionStorage.getItem("featul:home-scroll:v4")||"0",10)||0}catch(e){}if(!reload)y=0;var h=document.documentElement;h.style.scrollBehavior="auto";if(y>0){h.setAttribute("data-scrolled","");if(y>=80)h.style.opacity="0";function go(){scrollTo(0,y);if(y>=80)h.style.opacity=""}go();addEventListener("DOMContentLoaded",go);addEventListener("load",go)}})();`,
          }}
        />
        {selineToken ? (
          <Script
            src="https://cdn.seline.com/seline.js"
            data-token={selineToken}
            strategy="afterInteractive"
          />
        ) : null}
        <OrganizationJsonLd />
        <script
          id="site-navigation-jsonld"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              buildSiteNavigationSchema(SITE_URL, [
                { name: "Home", href: "/" },
                ...navigationConfig.main.filter((i) =>
                  ["/pricing", "/blog"].includes(i.href),
                ),
                ...footerNavigationConfig.groups
                  .flatMap((g) => g.items)
                  .filter((i) =>
                    ["/tools", "/definitions", "/alternatives"].includes(
                      i.href,
                    ),
                  ),
              ]),
            ),
          }}
        />
        <script
          id="software-app-jsonld"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildSoftwareApplicationSchema(SITE_URL)),
          }}
        />
        <script
          id="website-jsonld"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(buildWebSiteSchema(SITE_URL)),
          }}
        />
      </head>
      <body suppressHydrationWarning>
        {children}
        <DebugTools />
      </body>
    </html>
  );
}
