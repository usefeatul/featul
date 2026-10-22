import { expect, mock, test } from "bun:test"
import {
  fetchCannyData,
  fetchNoltData,
  fetchProductboardData,
  htmlToText,
  parseNoltCsv,
  ProviderImportError,
  resolveNoltBoardOrigin,
} from "./providers"

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })

test("Canny pages posts and comments and keeps replies linked", async () => {
  const fetcher = mock(async (url: string, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body))
    expect(body.apiKey).toBe("key")
    if (url.endsWith("/v1/posts/list")) {
      if (body.skip === 0) {
        return json({
          hasMore: true,
          posts: [{ id: "p1", title: "Dark mode", details: "Please", status: "under review", score: 7, created: "2024-01-02T00:00:00Z", board: { name: "Features" }, author: { email: "a@x.io" }, imageURLs: ["https://img/1.png"] }],
        })
      }
      return json({ hasMore: false, posts: [{ id: "p2", title: "SSO", details: "", status: "complete", score: 2, board: { name: "Enterprise" } }] })
    }
    if (url.endsWith("/v2/comments/list")) {
      if (!body.cursor) {
        return json({ hasNextPage: true, cursor: "c2", items: [{ id: "c1", value: "+1", post: { id: "p1" }, author: { name: "Ana" } }] })
      }
      return json({
        hasNextPage: false,
        items: [
          { id: "c2", value: "Agreed", post: { id: "p1" }, parentID: "c1", internal: true },
          { id: "c3", value: "orphan", post: { id: "missing" } },
        ],
      })
    }
    throw new Error(`unexpected ${url}`)
  })

  const data = await fetchCannyData("key", fetcher as unknown as typeof fetch)
  expect(data.posts.map((p) => p.sourceId)).toEqual(["canny_p1", "canny_p2"])
  expect(data.posts[0]).toMatchObject({ title: "Dark mode", boardName: "Features", status: "under review", upvotes: 7, authorEmail: "a@x.io", imageUrls: ["https://img/1.png"] })
  expect(data.comments).toHaveLength(2)
  expect(data.comments[1]).toMatchObject({ sourceId: "canny_c2", parentSourceId: "canny_c1", isInternal: true })
})

test("Canny reports a rejected key", async () => {
  const fetcher = mock(async () => json({ error: "invalid api key" }, 401))
  await expect(fetchCannyData("bad", fetcher as unknown as typeof fetch)).rejects.toThrow(/rejected the API key/)
})

test("ProductBoard resolves boards through subfeature parents and skips archived", async () => {
  const pages: Record<string, unknown> = {
    feature: {
      data: [
        { id: "f1", type: "feature", fields: { name: "Exports", description: "<p>CSV &amp; PDF</p><ul><li>fast</li></ul>", status: { name: "In progress" } }, relationships: { data: [{ type: "parent", target: { id: "comp1" } }] } },
        { id: "f2", type: "subfeature", fields: { name: "PDF export", status: { name: "Released" } }, relationships: { data: [{ type: "parent", target: { id: "f1" } }] } },
        { id: "f3", type: "feature", fields: { name: "Old", archived: true } },
      ],
      links: { next: "https://evil.example/steal" },
    },
    component: { data: [{ id: "comp1", type: "component", fields: { name: "Reporting" } }], links: { next: null } },
    product: { data: [], links: { next: null } },
  }
  const fetcher = mock(async (url: string, init?: RequestInit) => {
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer tok")
    const type = new URL(url).searchParams.get("type[]")!
    return json(pages[type])
  })

  const data = await fetchProductboardData("tok", fetcher as unknown as typeof fetch)
  // The off-host `next` link is never followed.
  expect(fetcher).toHaveBeenCalledTimes(3)
  expect(data.posts).toHaveLength(2)
  expect(data.posts[0]).toMatchObject({ sourceId: "productboard_f1", boardName: "Reporting", content: "CSV & PDF\n\n- fast" })
  expect(data.posts[1]).toMatchObject({ boardName: "Reporting", status: "Released" })
  expect(data.warnings[0]).toMatch(/archived/)
})

test("Nolt only accepts nolt.io hosts", () => {
  expect(resolveNoltBoardOrigin("acme")).toBe("https://acme.nolt.io")
  expect(resolveNoltBoardOrigin("https://Acme.nolt.io/some/path")).toBe("https://acme.nolt.io")
  expect(resolveNoltBoardOrigin("acme.eu.nolt.io")).toBe("https://acme.eu.nolt.io")
  expect(() => resolveNoltBoardOrigin("nolt.io.evil.com")).toThrow(ProviderImportError)
  expect(() => resolveNoltBoardOrigin("http://169.254.169.254")).toThrow(ProviderImportError)
})

test("Nolt CSV maps columns and falls back to a stable title hash", async () => {
  const csv = "Title,Description,Status,Votes,Board\nDark mode,Please,Planned,4,Ideas\nDark mode 2,,,,\n"
  const fetcher = mock(async (url: string) => {
    expect(url).toBe("https://acme.nolt.io/api/csv?apikey=k%26y")
    return new Response(csv)
  })
  const data = await fetchNoltData("acme.nolt.io", "k&y", fetcher as unknown as typeof fetch)
  expect(data.posts[0]).toMatchObject({ title: "Dark mode", status: "Planned", upvotes: 4, boardName: "Ideas" })
  expect(data.posts[0]!.sourceId).toMatch(/^nolt_[a-f0-9]{16}$/)
  expect(parseNoltCsv(csv).posts[0]!.sourceId).toBe(data.posts[0]!.sourceId)
})

test("htmlToText keeps paragraphs readable", () => {
  expect(htmlToText("<h2>Hi</h2><p>a<br>b</p>")).toBe("Hi\na\nb")
})
