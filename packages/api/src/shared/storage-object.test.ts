import { describe, expect, test } from "bun:test"
import {
  isDeletableContentKey,
  objectKeyFromPublicUrl,
  publicUrlForKey,
  workspaceSlugFromContentKey,
} from "./storage-object"
import { droppedImageUrls, listCommentImageUrls } from "./post-images"

const publicBase = "https://cdn.example.com"

describe("storage object keys", () => {
  test("parses a public post image URL", () => {
    const key = "workspaces/acme/posts/abc-shot.png"
    const url = publicUrlForKey(publicBase, key)
    expect(objectKeyFromPublicUrl(url, publicBase)).toBe(key)
    expect(isDeletableContentKey(key)).toBe(true)
    expect(workspaceSlugFromContentKey(key)).toBe("acme")
  })

  test("rejects branding and path traversal keys", () => {
    expect(isDeletableContentKey("workspaces/acme/branding/logo/x.png")).toBe(false)
    expect(isDeletableContentKey("workspaces/acme/posts/../secret.png")).toBe(false)
    expect(
      isDeletableContentKey(
        objectKeyFromPublicUrl(`${publicBase}/workspaces/acme/posts/../x.png`, publicBase) || "",
      ),
    ).toBe(false)
    expect(objectKeyFromPublicUrl("https://evil.example/workspaces/acme/posts/x.png", publicBase)).toBeNull()
    expect(
      objectKeyFromPublicUrl(
        `${publicBase}/workspaces/acme/posts/abc-shot.png?v=1`,
        publicBase,
      ),
    ).toBe("workspaces/acme/posts/abc-shot.png")
  })
})

describe("dropped image URLs", () => {
  test("returns URLs that left the next set", () => {
    expect(
      droppedImageUrls(
        ["https://cdn.example.com/a.png", "https://cdn.example.com/b.png"],
        ["https://cdn.example.com/b.png"],
      ),
    ).toEqual(["https://cdn.example.com/a.png"])
  })

  test("reads comment attachment URLs", () => {
    expect(
      listCommentImageUrls({
        attachments: [{ url: "https://cdn.example.com/c.png", type: "image/png" }],
      }),
    ).toEqual(["https://cdn.example.com/c.png"])
  })
})
