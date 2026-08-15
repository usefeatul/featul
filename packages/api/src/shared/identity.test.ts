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
    const identity = {
      id: "user_1",
      email: "Ada@Example.com",
      name: "Ada",
      avatar: "https://example.com/ada.png",
      expiresAt: 1_000_300,
    };
    const signature = signWidgetIdentity(secret, "workspace_1", identity);
    expect(
      isVerifiedIdentity(
        { ...identity, signature },
        secret,
        "workspace_1",
        1_000_000,
      ),
    ).toBe(true);
  });

  test("rejects unsigned or wrong signatures", () => {
    const secret = createWidgetSecret();
    const identity = {
      id: "user_1",
      email: "ada@example.com",
      name: "Ada",
      expiresAt: 1_000_300,
    };
    expect(isVerifiedIdentity(identity, secret, "workspace_1", 1_000_000)).toBe(
      false,
    );
    expect(
      isVerifiedIdentity(
        {
          ...identity,
          signature: signWidgetIdentity(secret, "workspace_1", {
            ...identity,
            id: "other",
          }),
        },
        secret,
        "workspace_1",
        1_000_000,
      ),
    ).toBe(false);
    expect(
      isVerifiedIdentity(
        {
          ...identity,
          signature: signWidgetIdentity(secret, "workspace_1", identity),
        },
        null,
        "workspace_1",
        1_000_000,
      ),
    ).toBe(false);
    expect(
      isVerifiedIdentity(undefined, secret, "workspace_1", 1_000_000),
    ).toBe(false);
  });

  test("rejects tampered, expired, and cross-workspace identities", () => {
    const secret = createWidgetSecret();
    const identity = {
      id: "user_1",
      email: "ada@example.com",
      name: "Ada",
      expiresAt: 1_000_300,
    };
    const signature = signWidgetIdentity(secret, "workspace_1", identity);
    expect(
      isVerifiedIdentity(
        { ...identity, name: "Mallory", signature },
        secret,
        "workspace_1",
        1_000_000,
      ),
    ).toBe(false);
    expect(
      isVerifiedIdentity(
        { ...identity, signature },
        secret,
        "workspace_2",
        1_000_000,
      ),
    ).toBe(false);
    expect(
      isVerifiedIdentity(
        { ...identity, signature },
        secret,
        "workspace_1",
        1_000_400,
      ),
    ).toBe(false);
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
      workspaceDomain: "app.convex.dev",
      customDomain: "feedback.convex.dev",
      verifiedHosts: ["notes.convex.dev"],
      appOrigin: "https://app.featul.com",
      configuredOrigins: ["https://dashboard.convex.dev"],
      includeDevOrigins: true,
    });
    expect(list).toContain("https://convex.featul.com");
    expect(list).toContain("https://app.convex.dev");
    expect(list).toContain("https://feedback.convex.dev");
    expect(list).toContain("https://notes.convex.dev");
    expect(list).toContain("https://app.featul.com");
    expect(list).toContain("https://dashboard.convex.dev");
    expect(list).toContain("http://localhost:3000");
  });

  test("does not implicitly trust localhost in production", () => {
    const list = buildWidgetOriginAllowlist({ slug: "convex" });
    expect(list).not.toContain("http://localhost:3000");
  });
});
