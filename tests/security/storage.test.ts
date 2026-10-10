import { expect, test } from "bun:test";
import {
  protectedImageKey,
  protectedImageUrl,
} from "../../packages/api/src/storage/protected";
import { consentTarget } from "../../apps/web/src/lib/consent";
import { assertWorkspaceAssetUrl } from "../../packages/api/src/storage/urls";
process.env.NEXT_PUBLIC_APP_URL = "https://app.example.com";

test("content writes reject legacy public URLs after private storage cutover", () => {
  const previousBase = process.env.R2_PUBLIC_BASE_URL;
  process.env.R2_PUBLIC_BASE_URL = "https://assets.example.com";
  try {
    for (const folder of ["posts", "comments"]) {
      const key = `workspaces/test/${folder}/123-image.png`;
      expect(() => assertWorkspaceAssetUrl(protectedImageUrl(key), "test", [folder])).not.toThrow();
      expect(() => assertWorkspaceAssetUrl(`https://assets.example.com/${key}`, "test", [folder])).toThrow();
      expect(() => assertWorkspaceAssetUrl(protectedImageUrl(key), "other", [folder])).toThrow();
    }
    expect(() => assertWorkspaceAssetUrl("https://assets.example.com/workspaces/test/branding/logo/logo.png", "test", ["branding/logo"])).not.toThrow();
  } finally {
    if (previousBase === undefined) delete process.env.R2_PUBLIC_BASE_URL;
    else process.env.R2_PUBLIC_BASE_URL = previousBase;
  }
});

test("protected image URLs use canonical, origin-bound content keys", () => {
  const key = "workspaces/test/comments/123-image.png";
  const url = protectedImageUrl(key);
  expect(protectedImageKey(url)).toBe(key);
  for (const value of [
    url.replace("app.example.com", "attacker.invalid"),
    url + "&extra=1",
    url + "#fragment",
    protectedImageUrl("users/other/avatar/image.png"),
    protectedImageUrl("workspaces/test/comments/../secret"),
  ])
    expect(protectedImageKey(value)).toBeNull();
});

test("decoded Next catch-all URL cannot switch the consent origin", async () => {
  const { getRouteMatcher } =
    await import("next/dist/shared/lib/router/utils/route-matcher");
  const { getRouteRegex } =
    await import("next/dist/shared/lib/router/utils/route-regex");
  const match = getRouteMatcher(getRouteRegex("/api/c15t/[...path]"))(
    "/api/c15t/https:%2F%2Fattacker.invalid%2Fcollect",
  );
  expect(match).toBeTruthy();
  expect(() =>
    consentTarget(
      "https://consent.example",
      (match as { path: string[] }).path,
      "",
    ),
  ).toThrow();
});
