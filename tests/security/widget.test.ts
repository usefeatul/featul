import "./setup";
import { expect, test } from "bun:test";
import {
  uploaderTagFromKey,
  widgetUploaderTag,
} from "../../packages/api/src/router/widget/uploads";
import {
  foreignRequestOrigin,
  widgetAllowedOrigins,
  widgetFrameAncestors,
} from "../../packages/api/src/router/widget/origins";
import {
  ENTRY_CONTENT_MAX_DEPTH,
  entryContentSchema,
} from "../../packages/api/src/validators/changelog";
import { getSafeImageSrc } from "../../packages/editor/src/lib/safe-url";

test("widget uploads are bound to the uploader and unforgeable without the secret", () => {
  const tag = widgetUploaderTag("secret", "ws1", "fw_alice");
  expect(tag).toMatch(/^u[a-f0-9]{24}$/);
  expect(widgetUploaderTag("secret", "ws1", "fw_bob")).not.toBe(tag);
  expect(widgetUploaderTag("other", "ws1", "fw_alice")).not.toBe(tag);
  expect(widgetUploaderTag("secret", "ws2", "fw_alice")).not.toBe(tag);

  const id = "0b6f0c55-1c1e-4bb1-9a53-0e5f4c2b7a10";
  expect(uploaderTagFromKey(`workspaces/acme/posts/${id}.${tag}-photo.png`)).toBe(tag);
  expect(uploaderTagFromKey(`workspaces/acme/posts/${id}.${tag}-a.b-c.png`)).toBe(tag);
  // Legacy and anonymous uploads carry no tag and are never widget-deletable.
  expect(uploaderTagFromKey(`workspaces/acme/posts/${id}-photo.png`)).toBeNull();
  // A tag smuggled into the file name does not count.
  expect(uploaderTagFromKey(`workspaces/acme/posts/${id}-x.${tag}-photo.png`)).toBeNull();
});

test("widget API treats only cross-origin browser calls as foreign", () => {
  const req = (origin?: string) =>
    new Request("https://app.example.com/api/widget/posts", {
      method: "POST",
      headers: origin ? { origin } : {},
    });
  expect(foreignRequestOrigin(req())).toBeNull();
  expect(foreignRequestOrigin(req("https://app.example.com"))).toBeNull();
  expect(foreignRequestOrigin(req("https://evil.example"))).toBe("https://evil.example");
  expect(foreignRequestOrigin(req("null"))).toBe("null");
});

test("widget frame-ancestors only emits strict origins from the allowlist", () => {
  const origins = widgetAllowedOrigins(
    {
      slug: "acme",
      domain: "acme.com",
      customDomain: null,
      widgetAllowedOrigins: ["https://docs.acme.com", 42],
    },
    [
      { host: "feedback.acme.com", status: "verified" },
      { host: "pending.acme.com", status: "pending" },
    ],
  );
  expect(origins).toContain("https://acme.com");
  expect(origins).toContain("https://docs.acme.com");
  expect(origins).toContain("https://feedback.acme.com");
  expect(origins).not.toContain("https://pending.acme.com");

  const value = widgetFrameAncestors([
    ...origins,
    "https://x.com; script-src *",
    "https://y.com\r\nSet-Cookie: a=b",
    "*",
  ]);
  expect(value.startsWith("'self' ")).toBe(true);
  expect(value).toContain("https://acme.com");
  expect(value).not.toContain(";");
  expect(value).not.toContain("*");
  expect(value).not.toContain("\n");
});

test("changelog/help content caps size and depth and drops unsafe images", () => {
  let deep: Record<string, unknown> = { type: "text", text: "x" };
  for (let i = 0; i < ENTRY_CONTENT_MAX_DEPTH + 1; i++) {
    deep = { type: "bulletList", content: [deep] };
  }
  expect(entryContentSchema.safeParse({ type: "doc", content: [deep] }).success).toBe(false);

  const big = { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "a".repeat(600_000) }] }] };
  expect(entryContentSchema.safeParse(big).success).toBe(false);

  const parsed = entryContentSchema.parse({
    type: "doc",
    content: [
      { type: "image", attrs: { src: "data:image/png;base64,AAAA" } },
      { type: "figure", attrs: { src: "javascript:alert(1)" } },
      { type: "figure", attrs: { src: "http://evil.example/a.png" } },
      { type: "figure", attrs: { src: "https://cdn.example.com/a.png" } },
      { type: "paragraph", content: [{ type: "image", attrs: { src: "data:x" } }] },
    ],
  });
  expect(parsed.content).toEqual([
    { type: "figure", attrs: { src: "https://cdn.example.com/a.png" } },
    { type: "paragraph", content: [] },
  ]);
});

test("editor image sources must be https (or local dev http)", () => {
  expect(getSafeImageSrc("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
  expect(getSafeImageSrc("http://localhost:3000/api/storage/image?key=x")).not.toBeNull();
  expect(getSafeImageSrc("http://evil.example/a.png")).toBeNull();
  expect(getSafeImageSrc("data:image/png;base64,AAAA")).toBeNull();
  expect(getSafeImageSrc("javascript:alert(1)")).toBeNull();
  expect(getSafeImageSrc("/relative.png")).toBeNull();
  expect(getSafeImageSrc(null)).toBeNull();
});
