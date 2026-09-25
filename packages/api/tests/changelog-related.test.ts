import { describe, expect, test } from "bun:test";
import { createEntrySchema, updateEntrySchema } from "../src/validators/changelog";

describe("changelog related post input", () => {
  const draft = { slug: "workspace", title: "An update", content: { type: "doc" } };
  test("deduplicates links and permits clearing all links", () => {
    expect(createEntrySchema.parse({ ...draft, relatedPostIds: ["one", "one", "two"] }).relatedPostIds).toEqual(["one", "two"]);
    expect(updateEntrySchema.parse({ slug: "workspace", entryId: "entry", relatedPostIds: [] }).relatedPostIds).toEqual([]);
  });
  test("omitted links remain omitted for existing clients and imports", () => {
    expect(updateEntrySchema.parse({ slug: "workspace", entryId: "entry", title: "Changed" }).relatedPostIds).toBeUndefined();
  });
  test("rejects invalid and excessive relationships", () => {
    expect(createEntrySchema.safeParse({ ...draft, relatedPostIds: [""] }).success).toBe(false);
    expect(createEntrySchema.safeParse({ ...draft, relatedPostIds: Array.from({ length: 21 }, (_, i) => String(i)) }).success).toBe(false);
  });
});
