import { describe, expect, test } from "bun:test";
import { DEFAULT_GITHUB_STATUS_SETTINGS, extractRequestRefs, refBelongsTo, roadmapStatusForIssue } from "./status";

const settings = DEFAULT_GITHUB_STATUS_SETTINGS;
const issue = (state: "open" | "closed", stateReason: string | null = null, labels: string[] = []) => ({
  state,
  stateReason,
  labels,
});

describe("roadmapStatusForIssue", () => {
  test("open issues use the workspace's open status", () => {
    expect(roadmapStatusForIssue(issue("open"), settings)).toBe("planned");
    expect(roadmapStatusForIssue(issue("open"), { ...settings, openStatus: "review" })).toBe("review");
    expect(roadmapStatusForIssue(issue("open", "reopened"), settings)).toBe("planned");
  });

  test("progress labels match loosely", () => {
    for (const label of ["in progress", "In Progress", "in-progress", "in_progress"]) {
      expect(roadmapStatusForIssue(issue("open", null, ["bug", label]), settings)).toBe("progress");
    }
    expect(roadmapStatusForIssue(issue("open", null, ["wip"]), settings)).toBe("planned");
    expect(roadmapStatusForIssue(issue("open", null, ["wip"]), { ...settings, progressLabels: ["WIP"] })).toBe("progress");
  });

  test("closed issues follow the close reason, ignoring labels", () => {
    expect(roadmapStatusForIssue(issue("closed", "completed", ["in progress"]), settings)).toBe("completed");
    expect(roadmapStatusForIssue(issue("closed", null), settings)).toBe("completed");
    expect(roadmapStatusForIssue(issue("closed", "not_planned"), settings)).toBe("closed");
    expect(roadmapStatusForIssue(issue("closed", "duplicate"), settings)).toBe("closed");
  });
});

describe("extractRequestRefs", () => {
  const body = [
    "Fixes the request at https://Acme.featul.com/board/p/Dark-Mode.",
    "Also [this one](https://app.featul.com/workspaces/acme/requests/night-theme?tab=activity)",
    "and https://feedback.acme.io/board/p/sso-login plus a dupe https://acme.featul.com/board/p/dark-mode",
    "not https://github.com/acme/app/issues/1 or https://acme.featul.com/roadmap",
  ].join("\n");

  test("finds public and app request links, deduplicated", () => {
    expect(extractRequestRefs(body)).toEqual([
      { kind: "public", host: "acme.featul.com", postSlug: "dark-mode" },
      { kind: "app", workspaceSlug: "acme", postSlug: "night-theme" },
      { kind: "public", host: "feedback.acme.io", postSlug: "sso-login" },
    ]);
    expect(extractRequestRefs(null)).toEqual([]);
  });

  test("links only count for the workspace they point at", () => {
    const [sub, app, custom] = extractRequestRefs(body);
    const acme = { slug: "acme", customDomain: "feedback.acme.io" };
    const other = { slug: "other", customDomain: null };
    expect([sub, app, custom].map((ref) => refBelongsTo(ref!, acme))).toEqual([true, true, true]);
    expect([sub, app, custom].map((ref) => refBelongsTo(ref!, other))).toEqual([false, false, false]);
    expect(refBelongsTo({ kind: "public", host: "acme.localhost:3000", postSlug: "x" }, acme)).toBe(true);
    // A look-alike host can't claim another workspace's requests.
    expect(refBelongsTo({ kind: "public", host: "acme.featul.com.evil.io", postSlug: "x" }, acme)).toBe(false);
  });
});
