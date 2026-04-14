import { afterEach, describe, expect, it, vi } from "vitest";

async function loadTrustedOriginsModule() {
  vi.resetModules();
  return import("./trusted-origins");
}

describe("trusted origins", () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("normalizes valid origins and removes duplicates", async () => {
    process.env.NODE_ENV = "development";
    const { getValidatedTrustedOrigins } = await loadTrustedOriginsModule();

    expect(
      getValidatedTrustedOrigins(
        "AUTH_TRUSTED_ORIGINS",
        "https://app.featul.com, https://APP.featul.com/, https://*.featul.com",
      ),
    ).toEqual(["https://app.featul.com", "https://*.featul.com"]);
  });

  it("ignores invalid values in non-production", async () => {
    process.env.NODE_ENV = "development";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getValidatedTrustedOrigins } = await loadTrustedOriginsModule();

    expect(
      getValidatedTrustedOrigins(
        "AUTH_TRUSTED_ORIGINS",
        "notaurl, https://app.featul.com/path, https://ok.featul.com",
      ),
    ).toEqual(["https://ok.featul.com"]);
    expect(warn).toHaveBeenCalledTimes(1);
  });

  it("rejects production-unsafe patterns in production", async () => {
    process.env.NODE_ENV = "production";
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const { getValidatedTrustedOrigins } = await loadTrustedOriginsModule();

    expect(
      getValidatedTrustedOrigins(
        "AUTH_TRUSTED_ORIGINS",
        "http://localhost:3000, https://app.featul.com",
      ),
    ).toEqual(["https://app.featul.com"]);
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining("Ignoring non-production trusted origin entries"),
    );
  });

  it("matches wildcard and exact origins", async () => {
    process.env.NODE_ENV = "development";
    const { isConfiguredTrustedOrigin } = await loadTrustedOriginsModule();

    expect(
      isConfiguredTrustedOrigin("https://feedback.featul.com", [
        "https://*.featul.com",
      ]),
    ).toBe(true);
    expect(
      isConfiguredTrustedOrigin("https://app.featul.com", [
        "https://app.featul.com",
      ]),
    ).toBe(true);
    expect(
      isConfiguredTrustedOrigin("https://evil.test", [
        "https://*.featul.com",
      ]),
    ).toBe(false);
  });
});
