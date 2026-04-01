import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { normalizeRedirectParam, resolveAuthRedirect } from "./redirect";

describe("redirect helpers", () => {
  const originalAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = "https://app.featul.com";
  });

  afterAll(() => {
    process.env.NEXT_PUBLIC_APP_URL = originalAppUrl;
  });

  it("accepts safe internal redirects", () => {
    expect(normalizeRedirectParam("/workspaces/acme?page=2")).toBe(
      "/workspaces/acme?page=2",
    );
  });

  it("rejects ambiguous or external redirects", () => {
    expect(normalizeRedirectParam("//evil.test/steal")).toBe("");
    expect(normalizeRedirectParam("https://evil.test/steal")).toBe("");
  });

  it("accepts allowed app hosts and falls back when invalid", () => {
    expect(
      normalizeRedirectParam("https://app.featul.com/workspaces/acme"),
    ).toBe("https://app.featul.com/workspaces/acme");
    expect(
      normalizeRedirectParam("https://sub.featul.com/workspaces/acme"),
    ).toBe("https://sub.featul.com/workspaces/acme");
    expect(resolveAuthRedirect("https://evil.test/steal")).toBe("/start");
  });
});
