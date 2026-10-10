import { expect, test } from "bun:test";
process.env.AUTH_TRUSTED_ORIGINS = "https://app.example.com";
const { withCors, handlePreflight } =
  await import("../../packages/auth/src/trust");

test("untrusted simple credentialed GET strips inner CORS, including errors", async () => {
  for (const status of [200, 401, 500]) {
    const response = await withCors(
      new Request("https://app.example.com/api/workspace", {
        headers: {
          origin: "https://attacker.invalid",
          cookie: "synthetic=secret",
        },
      }),
      new Response("{}", {
        status,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": "true",
          Vary: "Accept-Encoding",
        },
      }),
    );
    expect(response.headers.get("Access-Control-Allow-Origin")).toBeNull();
    expect(response.headers.get("Access-Control-Allow-Credentials")).toBeNull();
    expect(response.headers.get("Cache-Control")).toBe("private, no-store");
    expect(response.headers.get("Vary")).toBe("Accept-Encoding, Origin");
  }
});
test("explicit trusted origin works and hostile preflight receives no grant", async () => {
  const response = await withCors(
    new Request("https://app.example.com/api", {
      headers: { origin: "https://app.example.com" },
    }),
    new Response("{}"),
  );
  expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
    "https://app.example.com",
  );
  expect(response.headers.get("Access-Control-Allow-Credentials")).toBe("true");
  const denied = await handlePreflight(
    new Request("https://app.example.com/api", {
      method: "OPTIONS",
      headers: { origin: "https://app.example.com.attacker.invalid" },
    }),
  );
  expect(denied.headers.get("Access-Control-Allow-Origin")).toBeNull();
});
