import { describe, expect, test } from "bun:test";
import {
  buildWidgetOriginAllowlist,
  createWidgetSecret,
  isAllowedWidgetMessageOrigin,
  isSafeWidgetParentOrigin,
  isVerifiedIdentity,
  signWidgetIdentity,
} from "./identity";

describe("widget identity HMAC", () => {
  test("accepts a matching signature", () => {
    const secret = createWidgetSecret();
    const signature = signWidgetIdentity(secret, "user_1", "Ada@Example.com");
    expect(
      isVerifiedIdentity(
        { id: "user_1", email: "Ada@Example.com", signature },
        secret,
      ),
    ).toBe(true);
  });

  test("rejects unsigned or wrong signatures", () => {
    const secret = createWidgetSecret();
    expect(isVerifiedIdentity({ id: "user_1", email: "ada@example.com" }, secret)).toBe(false);
    expect(
      isVerifiedIdentity(
        {
          id: "user_1",
          email: "ada@example.com",
          signature: signWidgetIdentity(secret, "other", "ada@example.com"),
        },
        secret,
      ),
    ).toBe(false);
    expect(
      isVerifiedIdentity(
        {
          id: "user_1",
          email: "ada@example.com",
          signature: signWidgetIdentity(secret, "user_1", "ada@example.com"),
        },
        null,
      ),
    ).toBe(false);
    expect(isVerifiedIdentity(undefined, secret)).toBe(false);
  });
});

describe("widget parent origin allowlist", () => {
  test("allows https and localhost http", () => {
    expect(isSafeWidgetParentOrigin("https://acme.com")).toBe(true);
    expect(isSafeWidgetParentOrigin("http://localhost:3000")).toBe(true);
    expect(isSafeWidgetParentOrigin("http://evil.com")).toBe(false);
    expect(isSafeWidgetParentOrigin("javascript:alert(1)")).toBe(false);
    expect(isSafeWidgetParentOrigin("https://acme.com/path")).toBe(false);
  });

  test("requires event origin to match the declared parent", () => {
    expect(
      isAllowedWidgetMessageOrigin("https://acme.com", "https://acme.com"),
    ).toBe(true);
    expect(
      isAllowedWidgetMessageOrigin("https://evil.com", "https://acme.com"),
    ).toBe(false);
  });

  test("builds workspace public origins", () => {
    const list = buildWidgetOriginAllowlist({
      slug: "convex",
      customDomain: "feedback.convex.dev",
      verifiedHosts: ["notes.convex.dev"],
      appOrigin: "https://app.featul.com",
    });
    expect(list).toContain("https://convex.featul.com");
    expect(list).toContain("https://feedback.convex.dev");
    expect(list).toContain("https://notes.convex.dev");
    expect(list).toContain("https://app.featul.com");
  });
});
