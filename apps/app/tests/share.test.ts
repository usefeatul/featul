import { describe, expect, test } from "bun:test";
import {
  buildLinksHtml,
  buildShareLinks,
  buildShareMessages,
  buildSignature,
  buildWidgetSnippet,
} from "../src/lib/share";

describe("workspace sharing assets", () => {
  test("uses the supplied public domain and omits private sections", () => {
    const links = buildShareLinks("https://ideas.example.com/", {
      roadmap: false,
      changelog: true,
    });
    expect(links.map((link) => link.url)).toEqual([
      "https://ideas.example.com",
      "https://ideas.example.com/changelog",
    ]);
    expect(buildLinksHtml(links)).not.toContain("/roadmap");
  });

  test("escapes workspace and user text in the HTML signature", () => {
    const signature = buildSignature(
      'Pat <img src=x onerror="alert(1)">',
      "R&D",
      "https://ideas.example.com/?a=1&b=2",
    );
    expect(signature.html).not.toContain("<img");
    expect(signature.html).toContain("&lt;img");
    expect(signature.html).toContain("R&amp;D");
    expect(signature.html).toContain("?a=1&amp;b=2");
    expect(signature.text).toContain("R&D");
  });

  test("message templates use the current workspace and board link", () => {
    const messages = buildShareMessages("Example", "https://ideas.example.com");
    expect(new Set(messages.map((message) => message.id)).size).toBe(
      messages.length,
    );
    for (const message of messages) {
      expect(message.text).toContain("Example");
      expect(message.text).toContain("https://ideas.example.com");
    }
  });

  test("embed code uses the real SDK, selected options, and safely quoted ID", () => {
    const snippet = buildWidgetSnippet('ws"</script>', "light", "left");
    expect(snippet).toContain('src="https://app.featul.com/widget/sdk/v1.js"');
    expect(snippet).toContain('theme: "light"');
    expect(snippet).toContain('position: "left"');
    expect(snippet).toContain('featul.init("ws\\"\\u003c/script>"');
    expect(snippet).not.toContain("localhost");
    expect(buildWidgetSnippet("ws_123")).toContain('theme: "auto"');
  });
});
