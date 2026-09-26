import { expect, test } from "bun:test";
import {
  JUST_SHIPPED_DURATION,
  releaseBadge,
} from "../src/components/widget/release";

const publishedAt = "2026-09-20T12:00:00Z";
const published = new Date(publishedAt).getTime();

test("Just shipped lasts exactly seven days from publication", () => {
  expect(releaseBadge({ publishedAt }, published)?.name).toBe("Just shipped");
  expect(
    releaseBadge({ publishedAt }, published + JUST_SHIPPED_DURATION - 1)?.name,
  ).toBe("Just shipped");
  expect(
    releaseBadge({ publishedAt }, published + JUST_SHIPPED_DURATION),
  ).toBeNull();
  expect(
    releaseBadge({ publishedAt }, published + JUST_SHIPPED_DURATION * 2),
  ).toBeNull();
});

test("real tags keep their names and colors regardless of publication age", () => {
  const tags = [{ name: " " }, { name: " Performance ", color: "#123456" }];
  for (const now of [published, published + JUST_SHIPPED_DURATION * 3]) {
    expect(releaseBadge({ publishedAt, tags }, now)).toEqual({
      name: "Performance",
      color: "#123456",
    });
  }
});

test("missing, invalid, and future dates never claim to have just shipped", () => {
  for (const date of [null, undefined, "", "invalid", "2026-10-01T12:00:00Z"]) {
    expect(releaseBadge({ publishedAt: date }, published)).toBeNull();
  }
});
