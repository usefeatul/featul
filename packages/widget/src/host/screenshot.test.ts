import { afterEach, expect, test } from "bun:test";
import { assertScreenshotContent, ScreenshotCaptureError } from "./screenshot";

const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
afterEach(() => {
  if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
  else Reflect.deleteProperty(globalThis, "document");
});

function capture(pixels: Uint8ClampedArray) {
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      createElement: () => ({
        getContext: () => ({
          drawImage() {},
          getImageData: () => ({ data: pixels }),
        }),
      }),
    },
  });
  return { width: 1200, height: 800 } as HTMLCanvasElement;
}

test("rejects a solid blank capture instead of opening the editor", () => {
  const pixels = new Uint8ClampedArray(64 * 64 * 4).fill(255);
  expect(() => assertScreenshotContent(capture(pixels))).toThrow(ScreenshotCaptureError);
});

test("accepts a capture containing rendered content", () => {
  const pixels = new Uint8ClampedArray(64 * 64 * 4).fill(255);
  pixels[400] = 32;
  expect(() => assertScreenshotContent(capture(pixels))).not.toThrow();
});

test("rejects a zero-sized capture", () => {
  expect(() => assertScreenshotContent({ width: 0, height: 0 } as HTMLCanvasElement)).toThrow(ScreenshotCaptureError);
});
