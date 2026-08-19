import { describe, expect, test } from "bun:test";
import {
  estimateDataUrlBytes,
  isWidgetScreenshotDataUrl,
} from "./screenshot";

describe("widget screenshot payload", () => {
  test("accepts jpeg data urls and rejects junk", () => {
    expect(
      isWidgetScreenshotDataUrl("data:image/jpeg;base64,/9j/4AAQSkZJRg=="),
    ).toBe(true);
    expect(isWidgetScreenshotDataUrl("data:text/html;base64,aaaa")).toBe(false);
    expect(isWidgetScreenshotDataUrl("https://example.com/shot.jpg")).toBe(
      false,
    );
  });

  test("estimates decoded size from base64", () => {
    expect(estimateDataUrlBytes("data:image/jpeg;base64,aaaa")).toBe(3);
  });
});
