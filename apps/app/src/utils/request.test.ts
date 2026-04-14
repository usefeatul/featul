import { describe, expect, it } from "vitest";
import {
  buildChangelogUrl,
  buildRequestsUrl,
  buildWorkspaceUrl,
  encodeArray,
  isAllSelected,
  parseArrayParam,
  toggleValue,
} from "./request";

function createParams(entries: Record<string, string>) {
  return {
    get(key: string) {
      return entries[key] ?? null;
    },
  };
}

describe("request utils", () => {
  it("parses JSON arrays and legacy URI-encoded arrays", () => {
    expect(parseArrayParam('["open","closed"]')).toEqual(["open", "closed"]);
    expect(parseArrayParam(encodeURIComponent('["bugs"]'))).toEqual(["bugs"]);
    expect(parseArrayParam("oops")).toEqual([]);
  });

  it("encodes arrays as JSON", () => {
    expect(encodeArray(["one", "two"])).toBe('["one","two"]');
  });

  it("toggles selected values", () => {
    expect(toggleValue(["a"], "b")).toEqual(["a", "b"]);
    expect(toggleValue(["a", "b"], "b")).toEqual(["a"]);
  });

  it("detects when all items are selected", () => {
    expect(isAllSelected(["a", "b"], ["a", "b"])).toBe(true);
    expect(isAllSelected(["a", "b"], ["a"])).toBe(false);
    expect(isAllSelected([], [])).toBe(false);
  });

  it("builds request URLs from existing filters and overrides", () => {
    const url = buildRequestsUrl(
      "acme",
      createParams({
        status: '["open"]',
        board: '["feedback"]',
        tag: '["vip"]',
        order: "oldest",
        search: "billing",
        page: "3",
      }),
      {
        status: ["closed"],
        search: "export",
        page: 1,
      },
    );

    expect(url).toBe(
      "/workspaces/acme/requests?status=%5B%22closed%22%5D&board=%5B%22feedback%22%5D&tag=%5B%22vip%22%5D&order=oldest&search=export&page=1",
    );
  });

  it("builds workspace and changelog pagination URLs", () => {
    const params = createParams({ page: "4" });

    expect(buildWorkspaceUrl("acme", params, {})).toBe("/workspaces/acme?page=4");
    expect(buildWorkspaceUrl("acme", params, { page: 2 })).toBe(
      "/workspaces/acme?page=2",
    );
    expect(buildChangelogUrl("acme", params, {})).toBe(
      "/workspaces/acme/changelog?page=4",
    );
  });
});
