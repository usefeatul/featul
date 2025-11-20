import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/"],
      disallow: ["/auth", "/dashboard", "/projects"],
    },
    sitemap: "https://feedgot.com/sitemap.xml",
    host: "https://feedgot.com",
  }
}