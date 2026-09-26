import { afterEach, expect, test } from "bun:test";
import { Window } from "happy-dom";
import { Editor } from "@tiptap/core";
import Document from "@tiptap/extension-document";
import Paragraph from "@tiptap/extension-paragraph";
import Text from "@tiptap/extension-text";
import { TableRow, TableCell, TableHeader } from "@tiptap/extension-table";
import { Table } from "../../../packages/editor/src/extensions/table/table";

const dom = new Window();
Object.assign(globalThis, { window: dom, document: dom.document, navigator: dom.navigator, HTMLElement: dom.HTMLElement, getComputedStyle: dom.getComputedStyle.bind(dom) });
let editor: Editor;
afterEach(() => { editor?.destroy(); document.body.innerHTML = ""; });
const content = {
  type: "doc",
  content: [{ type: "table", content: [{ type: "tableRow", content:
    ["Tool", "Best for", "Pricing", "Open source", "Roadmap"].map((text) => ({
      type: "tableCell", attrs: { colwidth: [180] },
      content: [{ type: "paragraph", content: [{ type: "text", text }] }],
    })),
  }] }],
};
function create(editable: boolean) {
  const element = document.createElement("div");
  document.body.appendChild(element);
  editor = new Editor({ element, editable, content, extensions: [Document, Paragraph, Text, Table, TableRow, TableCell, TableHeader] });
}

test("read-only tables have a focusable scroll region and retain every column", () => {
  create(false);
  const wrapper = editor.view.dom.querySelector(".tableScroll");
  expect(wrapper?.getAttribute("role")).toBe("region");
  expect(wrapper?.getAttribute("tabindex")).toBe("0");
  expect(wrapper?.querySelectorAll("td").length).toBe(5);
  expect(editor.getJSON().content?.[0]?.content?.[0]?.content?.[0]?.attrs?.colwidth).toEqual([180]);
});

test("editable tables retain their original markup when serialized", () => {
  create(true);
  expect(editor.getHTML()).not.toContain("tableScroll");
  expect(editor.getHTML()).toContain("<table");
});
