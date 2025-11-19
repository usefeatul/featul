import type { Metadata } from "next"
import { Providers } from "../components/providers/providers"
import "./styles/globals.css"

export const metadata: Metadata = {
  title: "Feedgot",
  description: "Created using Feedgot",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
