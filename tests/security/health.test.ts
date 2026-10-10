import { expect, test } from "bun:test";
import { requireRecentStorageCleanup, storageHealthKey } from "../../packages/api/src/storage/health";

const at = (value: string) => Date.parse(value);

test("cleanup gets its full UTC grace period, then a missed run fails", () => {
  const yesterday = at("2026-10-09T04:00:30Z");
  expect(() => requireRecentStorageCleanup(yesterday, at("2026-10-10T04:59:59Z"))).not.toThrow();
  expect(() => requireRecentStorageCleanup(yesterday, at("2026-10-10T05:00:00Z"))).toThrow();
  expect(() => requireRecentStorageCleanup(at("2026-10-10T04:00:30Z"), at("2026-10-10T05:00:00Z"))).not.toThrow();
});

test("UTC deadlines remain correct across month/year boundaries and DST", () => {
  for (const [lastRun, nextDeadline] of [
    ["2025-12-31T04:00:00Z", "2026-01-01T05:00:00Z"],
    ["2026-10-24T04:00:00Z", "2026-10-25T05:00:00Z"],
  ]) {
    expect(() => requireRecentStorageCleanup(at(lastRun!), at(nextDeadline!) - 1)).not.toThrow();
    expect(() => requireRecentStorageCleanup(at(lastRun!), at(nextDeadline!))).toThrow();
  }
});

test("missing, malformed, expired and future heartbeats fail closed", () => {
  const now = at("2026-10-10T12:00:00Z");
  for (const value of [null, undefined, "2026-10-10", NaN, Infinity, 0, now - 2 * 86400000, now + 120000]) {
    expect(() => requireRecentStorageCleanup(value, now)).toThrow();
  }
});

test("local and preview cleanup cannot satisfy production health", () => {
  const base = { BETTER_AUTH_URL: "https://app.featul.com", NODE_ENV: "production" } as NodeJS.ProcessEnv;
  const production = storageHealthKey({ ...base, VERCEL_ENV: "production" });
  expect(storageHealthKey({ ...base, VERCEL_ENV: "preview" })).not.toBe(production);
  expect(storageHealthKey({ ...base, BETTER_AUTH_URL: "http://localhost:3100" })).not.toBe(production);
  expect(() => storageHealthKey({})).toThrow();
});
