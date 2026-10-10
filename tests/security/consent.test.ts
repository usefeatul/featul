import { describe, expect, test } from "bun:test";
import {
  boundedBody,
  consentHeaders,
  consentTarget,
} from "../../apps/web/src/lib/consent";

describe("consent proxy boundary", () => {
  test("preserves the configured origin and base path", () => {
    expect(
      consentTarget("https://consent.example/api", ["v1", "consent"], "?a=1")
        .href,
    ).toBe("https://consent.example/api/v1/consent?a=1");
  });
  test.each([
    "https://attacker.invalid/collect",
    "//127.0.0.1",
    "..",
    ".",
    "%2e%2e",
    "a/b",
    "a\\b",
    "a?x=1",
    "a#x",
  ])("rejects decoded URL/traversal input %s", (part) => {
    expect(() =>
      consentTarget("https://consent.example/api", [part], ""),
    ).toThrow();
  });
  test("never forwards credentials or attacker proxy headers", () => {
    const headers = consentHeaders(
      new Headers({
        cookie: "session=secret",
        authorization: "Bearer secret",
        "x-forwarded-host": "attacker.invalid",
        "content-type": "application/json",
      }),
    );
    expect([...headers.entries()]).toEqual([
      ["content-type", "application/json"],
    ]);
  });
  test("enforces limits on streamed bodies without trusting Content-Length", async () => {
    const stream = new ReadableStream({
      start(c) {
        c.enqueue(new Uint8Array(256 * 1024));
        c.enqueue(new Uint8Array(1));
        c.close();
      },
    });
    await expect(boundedBody(stream)).rejects.toThrow("too large");
  });
});
