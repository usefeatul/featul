"use client";

import React from "react";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, EditorStaticContent, useFeatulEditor } from "@featul/editor";
import type { HelpHeading } from "./content";

// Element styling (headings, callouts, code, tables...) is the shared content design in
// @featul/editor's editor.css; this only sets the reading container.
const proseClass = "prose dark:prose-invert max-w-none focus:outline-none";

// Anchor jumps land below the sticky portal header.
const anchorClass = "[&_.ProseMirror_:is(h1,h2,h3,h4,h5,h6)]:scroll-mt-20";

/** Read-only article body; tags rendered headings with the ids the table of contents links to. */
export function HelpArticleBody({
  content,
  headings,
}: {
  content: JSONContent | null;
  headings: HelpHeading[];
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const editor = useFeatulEditor({
    content,
    editable: false,
    editorProps: { attributes: { class: proseClass } },
  });

  React.useEffect(() => {
    if (!editor || !ref.current) return;
    const frame = requestAnimationFrame(() => {
      const nodes = ref.current?.querySelectorAll<HTMLElement>(".ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror h4, .ProseMirror h5, .ProseMirror h6");
      let i = 0;
      nodes?.forEach((node) => {
        if (!node.textContent?.trim()) return;
        const heading = headings[i++];
        if (heading) node.id = heading.id;
      });
      // A shared link to #section should land there once the ids exist.
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (hash) document.getElementById(hash)?.scrollIntoView();
    });
    return () => cancelAnimationFrame(frame);
  }, [editor, headings]);

  return (
    <div ref={ref} className={anchorClass}>
      {editor ? (
        <EditorContent editor={editor} className="min-w-0 max-w-full" />
      ) : (
        <EditorStaticContent content={content} className={proseClass} />
      )}
    </div>
  );
}
