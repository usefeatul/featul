import { describe, expect, test } from "bun:test"
import { NextRequest } from "next/server"
import { getHostInfo, rewriteSubdomain } from "../src/middleware/host"
import { rewriteFeedback } from "../src/middleware/feedback"
import { middleware } from "../src/middleware/proxy"

function request(host: string, pathname = "/") {
  return new NextRequest(`http://${host}${pathname}`, { headers: { host } })
}

describe("development host routing", () => {
  for (const host of ["localhost:3000", "app.localhost:3000", "127.0.0.1:3000", "[::1]:3000", "192.168.0.7:3000"]) {
    test(`${host} skips the custom-domain database lookup`, async () => {
      const req = request(host, "/auth/signin")
      const ctx = getHostInfo(req)
      expect(ctx.isLocal).toBe(true)
      expect(rewriteSubdomain(req, ctx)).toBeNull()
      expect(await rewriteFeedback(req, ctx)).toBeNull()
    })
  }

  test("local tenant subdomains still rewrite to public workspace routes", () => {
    const req = request("demo.localhost:3000", "/roadmap")
    const response = rewriteSubdomain(req, getHostInfo(req))
    expect(new URL(response!.headers.get("x-middleware-rewrite")!).pathname).toBe("/demo/roadmap")
  })

  for (const host of ["featul.com", "app.featul.com", "APP.FEATUL.COM:3000"]) {
    test(`${host} skips custom-domain resolution`, async () => {
      const req = request(host)
      const ctx = getHostInfo(req)
      expect(ctx.isMainDomain).toBe(true)
      expect(await rewriteFeedback(req, ctx)).toBeNull()
    })
  }

  test("custom domains remain eligible for verified-domain resolution", () => {
    const ctx = getHostInfo(request("feedback.example.com"))
    expect(ctx.isLocal).toBe(false)
    expect(ctx.isMainDomain).toBe(false)
    expect(ctx.subdomain).toBe("")
  })
})

describe("session routing", () => {
  for (const path of ["/auth/signin?redirect=/start", "/auth/signup", "/start?redirect=/start"]) {
    test(`${path} leaves session validation to the page`, async () => {
      const req = new NextRequest(`http://localhost:3000${path}`, {
        headers: {
          host: "localhost:3000",
          cookie: "better-auth.session_token=expired; lastWorkspaceSlug=demo",
        },
      })
      const response = await middleware(req)
      expect(response.headers.get("location")).toBeNull()
      expect(response.headers.get("x-middleware-next")).toBe("1")
    })
  }

  test("workspace requests without a session cookie still require sign-in", async () => {
    const response = await middleware(request("localhost:3000", "/workspaces/demo"))
    const location = new URL(response.headers.get("location")!)
    expect(location.pathname).toBe("/auth/signin")
    expect(location.searchParams.get("redirect")).toBe("/workspaces/demo")
  })
})
