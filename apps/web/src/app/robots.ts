import type { MetadataRoute } from "next"
import { absoluteUrl, SITE_URL } from "@/config/seo"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: [absoluteUrl("/sitemap.xml")],
    host: new URL(SITE_URL).host,
  }
}