import "./setup";
import { expect, test } from "bun:test";
const { enforceTrustedBrowserOrigin } =
  await import("../../packages/api/src/request/origin");
const { normalizeRedirectParam } =
  await import("../../apps/app/src/utils/redirect");
const { isAuthorizedCron } =
  await import("../../apps/app/src/app/api/cron/authorize");
const { productionConfigurationErrors } =
  await import("../../packages/auth/src/configuration");
const { getAuthRateLimitStorage } =
  await import("../../packages/auth/src/rate/storage");

const post = (url: string, origin: string) =>
  new Request(url, { method: "POST", headers: { origin } });

test("private writes trust same origin and exact entries, not wildcard siblings", () => {
  expect(() =>
    enforceTrustedBrowserOrigin(
      post("https://tenant.example.com/api/comment/create", "https://tenant.example.com"),
    ),
  ).not.toThrow();
  expect(() =>
    enforceTrustedBrowserOrigin(
      post("https://tenant.example.com/api/comment/create", "https://app.example.com"),
    ),
  ).not.toThrow();
  expect(() =>
    enforceTrustedBrowserOrigin(
      post("https://app.example.com/api/comment/create", "https://tenant.example.com"),
    ),
  ).toThrow("Invalid request origin");
});

test("absolute redirects require https outside local dev", () => {
  process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";
  expect(normalizeRedirectParam("https://tenant.example.com/board")).toBe(
    "https://tenant.example.com/board",
  );
  expect(normalizeRedirectParam("http://tenant.example.com/board")).toBe("");
  expect(normalizeRedirectParam("http://localhost:3000/start")).toBe(
    "http://localhost:3000/start",
  );
});

test("cron routes require the exact bearer secret and fail closed when unset", () => {
  const original = process.env.CRON_SECRET;
  const request = (authorization?: string) =>
    new Request("https://app.example.com/api/cron/gc", {
      headers: authorization ? { authorization } : {},
    });
  try {
    process.env.CRON_SECRET = "s".repeat(32);
    expect(isAuthorizedCron(request(`Bearer ${"s".repeat(32)}`))).toBe(true);
    expect(isAuthorizedCron(request(`Bearer ${"s".repeat(31)}`))).toBe(false);
    expect(isAuthorizedCron(request())).toBe(false);
    delete process.env.CRON_SECRET;
    expect(isAuthorizedCron(request("Bearer "))).toBe(false);
  } finally {
    if (original === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = original;
  }
});

test("a configured GitHub App needs its own setup-state secret in production", () => {
  const secret = "a".repeat(32);
  const github = { GITHUB_APP_ID: "1", BETTER_AUTH_SECRET: secret };
  expect(productionConfigurationErrors(github)).toContain(
    "GITHUB_SETUP_STATE_SECRET is required when the GitHub App is configured",
  );
  expect(
    productionConfigurationErrors({ ...github, GITHUB_SETUP_STATE_SECRET: secret }),
  ).toContain("GITHUB_SETUP_STATE_SECRET must differ from BETTER_AUTH_SECRET");
  expect(
    productionConfigurationErrors({}).some((error) =>
      error.startsWith("GITHUB_SETUP_STATE_SECRET"),
    ),
  ).toBe(false);
});

test("enabled auth rate limiting refuses the per-instance memory fallback", () => {
  const keys = ["AUTH_RATE_LIMIT_ENABLED", "UPSTASH_REDIS_REST_URL", "UPSTASH_REDIS_REST_TOKEN", "KV_REST_API_URL", "KV_REST_API_TOKEN"];
  const original = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.KV_REST_API_URL;
    delete process.env.KV_REST_API_TOKEN;
    process.env.AUTH_RATE_LIMIT_ENABLED = "true";
    expect(() => getAuthRateLimitStorage()).toThrow("UPSTASH_REDIS_REST_URL");
    process.env.AUTH_RATE_LIMIT_ENABLED = "false";
    expect(getAuthRateLimitStorage()).toBeUndefined();
  } finally {
    for (const key of keys) {
      if (original[key] === undefined) delete process.env[key];
      else process.env[key] = original[key];
    }
  }
});
