import "./setup";
import { expect, test } from "bun:test";
import {
  protectedImageKey,
  protectedImageUrl,
} from "../../packages/api/src/storage/protected";
import { assertWorkspaceAssetUrl } from "../../packages/api/src/storage/urls";

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
