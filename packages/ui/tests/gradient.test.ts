import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { DitherGradient } from "../src/components/gradient";

describe("dither initial rendering", () => {
  test("includes a visible pattern before JavaScript or canvas initialization", () => {
    const markup = renderToStaticMarkup(createElement(DitherGradient, { from: "blue" }));
    expect(markup).toContain("data:image/svg+xml,");
    expect(markup).toContain("linear-gradient(to top, black, transparent)");
    expect(markup).not.toContain('hidden=""');
    expect(markup).toContain("<canvas");
  });

  test("preserves the initial pattern direction, color, and pixel size", () => {
    const markup = renderToStaticMarkup(createElement(DitherGradient, {
      from: [255, 255, 255], direction: "right", cell: 3, opacity: 0.35,
    }));
    expect(markup).toContain("background-size:12px 12px");
    expect(markup).toContain("linear-gradient(to right, black, transparent)");
    expect(markup).toContain("opacity:0.35");
    expect(markup).toContain(encodeURIComponent("rgba(255,255,255,"));
  });
});
