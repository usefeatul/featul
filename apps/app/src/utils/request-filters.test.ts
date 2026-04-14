import { describe, expect, it } from "vitest";
import {
  parseRequestFiltersFromRecord,
  parseRequestFiltersFromSearchParams,
} from "./request-filters";

describe("request filter parsing", () => {
  it("parses search params and normalizes status filters", () => {
    const params = new URLSearchParams({
      status: '["OPEN","review"]',
      board: '["feedback"]',
      tag: '["vip"]',
      order: "likes",
      search: "roadmap",
    });

    expect(parseRequestFiltersFromSearchParams(params)).toEqual({
      status: ["open", "review"],
      board: ["feedback"],
      tag: ["vip"],
      order: "likes",
      search: "roadmap",
    });
  });

  it("parses record-style search params with defaults", () => {
    expect(
      parseRequestFiltersFromRecord({
        status: ['["DONE"]'],
        order: "unknown",
      }),
    ).toEqual({
      status: ["done"],
      board: [],
      tag: [],
      order: "newest",
      search: "",
    });
  });
});
