import type { MetadataRoute } from "next"
import { headers } from "next/headers"

const RESERVED_SUBDOMAINS = new Set([
  "www",
  "app",
  "featul",
  "feedgot",
  "staging",
])

const PUBLIC_ALLOW = ["/", "/roadmap", "/changelog", "/board/", "/p/"]
const PUBLIC_DISALLOW = [
  "/api/",
  "/auth/",
  "/workspaces/",
  "/widget/",
  "/invite/",
  "/start",
  "/notifications",
  "/account",
  "/settings",
]

function workspaceRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: PUBLIC_ALLOW,
      disallow: PUBLIC_DISALLOW,
    },
  }
}

function blockRobots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      disallow: "/",
    },
  }
}

export default async function robots(): Promise<MetadataRoute.Robots> {
  const headerStore = await headers()
  const host = (headerStore.get("host") || "").replace(/:\d+$/, "").toLowerCase()

  // Dashboard / auth host — never crawl (keeps GSC domain property clean)
  if (host === "app.featul.com" || host.startsWith("app.")) {
    return blockRobots()
  }

  if (host.endsWith(".featul.com")) {
    const subdomain = host.slice(0, -".featul.com".length).split(".")[0] || ""
    if (!subdomain || RESERVED_SUBDOMAINS.has(subdomain)) {
      return blockRobots()
    }
    return workspaceRobots()
  }

  // Custom domains serving public workspace boards
  if (host && host !== "localhost" && !host.endsWith(".localhost")) {
    return workspaceRobots()
  }

  return blockRobots()
}
