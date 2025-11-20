import type { Metadata, Viewport } from "next"
import { Providers } from "../components/providers/providers"
import "./styles/globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://feedgot.com"),
  title: {
    default: "Feedgot",
    template: "%s – Feedgot",
  },
  description: "Plan, track, and ship projects with Feedgot.",
  applicationName: "Feedgot",
  keywords: [
    "Feedgot",
    "project management",
    "task planning",
    "productivity",
  ],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    title: "Feedgot",
    description: "Plan, track, and ship projects with Feedgot.",
    url: "https://feedgot.com",
    siteName: "Feedgot",
    type: "website",
    images: [{ url: "/android-chrome-512x512.png", width: 512, height: 512 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Feedgot",
    description: "Plan, track, and ship projects with Feedgot.",
    images: ["/android-chrome-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Feedgot",
    url: "https://feedgot.com",
    logo: "https://feedgot.com/android-chrome-512x512.png",
  }
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
