import { describe, expect, test } from "bun:test";
import {
  FRAME_SOURCE,
  HOST_SOURCE,
  createWidgetEnvelope,
  isAllowedWidgetMessageOrigin,
  isExpectedWidgetMessageSource,
  isSafeWidgetParentOrigin,
  readWidgetMessage,
} from "./protocol";

describe("widget postMessage protocol", () => {
  test("accepts https origins and localhost", () => {
    expect(isSafeWidgetParentOrigin("https://app.acme.com")).toBe(true);
    expect(isSafeWidgetParentOrigin("http://localhost:5173")).toBe(true);
    expect(isSafeWidgetParentOrigin("http://phishing.test")).toBe(false);
    expect(isSafeWidgetParentOrigin("https://app.acme.com/embed")).toBe(false);
  });

  test("rejects spoofed message origins", () => {
    expect(
      isAllowedWidgetMessageOrigin("https://evil.com", "https://app.acme.com"),
    ).toBe(false);
    expect(
      isAllowedWidgetMessageOrigin(
        "https://app.acme.com",
        "https://app.acme.com",
      ),
    ).toBe(true);
  });

  test("reads only envelopes from the expected source", () => {
    expect(
      readWidgetMessage({ source: HOST_SOURCE, type: "show" }, HOST_SOURCE)
        ?.type,
    ).toBe("show");
    expect(
      readWidgetMessage({ source: "other", type: "show" }, HOST_SOURCE),
    ).toBe(null);
    expect(createWidgetEnvelope(FRAME_SOURCE, "ready").source).toBe(
      FRAME_SOURCE,
    );
    expect(createWidgetEnvelope(HOST_SOURCE, "identify", null).payload).toBe(
      null,
    );
    expect(
      createWidgetEnvelope(FRAME_SOURCE, "open", { section: "home" }).type,
    ).toBe("open");
  });

  test("requires the exact message window", () => {
    const expected = {};
    expect(isExpectedWidgetMessageSource(expected, expected)).toBe(true);
    expect(isExpectedWidgetMessageSource({}, expected)).toBe(false);
    expect(isExpectedWidgetMessageSource(null, expected)).toBe(false);
  });
});
