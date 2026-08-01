import type { MetadataRoute } from "next"

/** App host should not advertise a sitemap; marketing lives on www.featul.com */
export default function sitemap(): MetadataRoute.Sitemap {
  return []
}
