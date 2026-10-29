import "./setup";
import { expect, test } from "bun:test";
const { productionConfigurationErrors } =
  await import("../../packages/auth/src/configuration");
const { isSelfHosted, readEnv } = await import("../../packages/auth/src/selfhost");
const { upstashCredentials } = await import("../../packages/auth/src/upstash");

const secret = "a".repeat(32);
// What the Deploy to Vercel button provides: three form values plus the Neon and Upstash integrations.
const vercelSelfHosted = {
  VERCEL: "1",
  FEATUL_DOMAIN: "feedback.acme.com",
  BETTER_AUTH_SECRET: secret,
  CRON_SECRET: "b".repeat(32),
  DATABASE_URL: "postgres://user:pass@ep-example.neon.tech/neondb",
  KV_REST_API_URL: "https://example.upstash.io",
  KV_REST_API_TOKEN: "token",
};

test("Featul Cloud still requires billing, email, and storage in production", () => {
  const errors = productionConfigurationErrors({ VERCEL: "1" });
  for (const key of ["STRIPE_SECRET_KEY", "RESEND_API_KEY", "R2_PRIVATE_BUCKET", "BETTER_AUTH_URL"]) {
    expect(errors).toContain(`${key} is required`);
  }
});

test("a Deploy to Vercel install passes the production checks with only its own settings", () => {
  expect(productionConfigurationErrors(vercelSelfHosted)).toEqual([]);
  expect(productionConfigurationErrors({ ...vercelSelfHosted, CRON_SECRET: "" })).toContain("CRON_SECRET is required");
  expect(productionConfigurationErrors({ ...vercelSelfHosted, KV_REST_API_TOKEN: "" })).toContain("UPSTASH_REDIS_REST_TOKEN is required");
});

test("self-hosted settings derive from FEATUL_DOMAIN, and explicit values win", () => {
  const env = { FEATUL_DOMAIN: "https://Feedback.Acme.com/" };
  expect(isSelfHosted(env)).toBe(true);
  expect(isSelfHosted({})).toBe(false);
  expect(isSelfHosted({ FEATUL_SELF_HOSTED: "true" })).toBe(true);
  expect(readEnv("NEXT_PUBLIC_APP_URL", env)).toBe("https://feedback.acme.com");
  expect(readEnv("AUTH_COOKIE_DOMAIN", env)).toBe("feedback.acme.com");
  expect(readEnv("AUTH_TRUSTED_ORIGINS", env)).toBe("https://feedback.acme.com,https://*.feedback.acme.com");
  expect(readEnv("BETTER_AUTH_URL", { ...env, BETTER_AUTH_URL: "https://app.acme.com" })).toBe("https://app.acme.com");
  expect(readEnv("BETTER_AUTH_URL", {})).toBeUndefined();
});

test("Upstash credentials accept the Vercel integration's names", () => {
  expect(upstashCredentials({ KV_REST_API_URL: "https://kv", KV_REST_API_TOKEN: "kv" })).toEqual({ url: "https://kv", token: "kv" });
  expect(upstashCredentials({ UPSTASH_REDIS_REST_URL: "https://u", UPSTASH_REDIS_REST_TOKEN: "u", KV_REST_API_URL: "https://kv", KV_REST_API_TOKEN: "kv" })).toEqual({ url: "https://u", token: "u" });
});
