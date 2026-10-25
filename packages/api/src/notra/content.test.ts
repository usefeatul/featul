import { expect, test } from "bun:test";
import { markdownToTiptapDoc, toPlainText } from "./content";

test("markdown images become block image nodes for HTTPS sources only", () => {
  const doc = markdownToTiptapDoc(
    [
      "Intro text",
      "![Dashboard](https://cdn.example.com/a.png)",
      '![](<https://cdn.example.com/b.png> "Title")',
      "![x](data:image/png;base64,AAA)",
      "![x](http://cdn.example.com/c.png)",
      "![x](javascript:alert(1))",
    ].join("\n"),
  );
  expect(doc.content).toEqual([
    { type: "paragraph", content: [{ type: "text", text: "Intro text" }] },
    { type: "image", attrs: { src: "https://cdn.example.com/a.png", alt: "Dashboard" } },
    { type: "image", attrs: { src: "https://cdn.example.com/b.png", alt: null } },
    // Not an image line (nested parentheses), so it stays inert text without a link mark.
    { type: "paragraph", content: [{ type: "text", text: "![x](javascript:alert(1))" }] },
  ]);
});

test("a document with only unsafe images falls back to the placeholder paragraph", () => {
  expect(markdownToTiptapDoc("![x](data:image/png;base64,AAA)").content).toEqual([
    { type: "paragraph", content: [{ type: "text", text: "No details provided." }] },
  ]);
});

test("plain-text summaries drop images but keep link text", () => {
  expect(toPlainText("![Dashboard](https://cdn.example.com/a.png) Faster [search](https://x.dev) ![](https://y.dev/b.png)")).toBe(
    "Faster search",
  );
});
