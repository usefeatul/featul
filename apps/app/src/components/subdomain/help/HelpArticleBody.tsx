"use client";

import React from "react";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useFeatulEditor } from "@featul/editor";
import { cn } from "@featul/ui/lib/utils";
import type { HelpHeading } from "./content";

const proseClass = cn(
  "prose dark:prose-invert max-w-none focus:outline-none text-[15px] leading-7 text-foreground/85",
  "prose-headings:scroll-mt-24 prose-headings:font-semibold prose-headings:tracking-tight prose-headings:text-foreground",
  "prose-h2:mt-10 prose-h2:mb-3 prose-h2:text-xl prose-h3:mt-8 prose-h3:mb-2 prose-h3:text-lg",
  "prose-p:my-3 prose-strong:text-foreground prose-li:my-1",
  "prose-a:font-medium prose-a:text-primary prose-a:underline prose-a:decoration-primary/40 hover:prose-a:decoration-primary",
  "prose-code:rounded-md prose-code:border prose-code:border-border/70 prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:text-[13px] prose-code:font-medium prose-code:before:content-none prose-code:after:content-none dark:prose-code:border-white/10 dark:prose-code:bg-white/5",
  "prose-img:max-w-full prose-img:rounded-xl prose-img:border prose-img:border-border/60 dark:prose-img:border-white/10",
  // Wide code and tables scroll inside themselves instead of widening the page on phones.
  "break-words prose-pre:max-w-full prose-pre:overflow-x-auto [&_table]:block [&_table]:max-w-full [&_table]:overflow-x-auto",
);

// editor.css styles `.ProseMirror blockquote` outside any cascade layer, so the overlapping properties need `!` to win.
const calloutClass = cn(
  "[&_.ProseMirror_blockquote]:my-6! [&_.ProseMirror_blockquote]:rounded-xl [&_.ProseMirror_blockquote]:border [&_.ProseMirror_blockquote]:border-l-[3px]! [&_.ProseMirror_blockquote]:border-border/70 [&_.ProseMirror_blockquote]:border-l-primary! [&_.ProseMirror_blockquote]:bg-muted/50 [&_.ProseMirror_blockquote]:px-4! [&_.ProseMirror_blockquote]:py-0.5 [&_.ProseMirror_blockquote]:not-italic! [&_.ProseMirror_blockquote]:text-foreground/90!",
  // Anchor jumps land below the sticky portal header.
  "[&_.ProseMirror_:is(h1,h2,h3,h4,h5,h6)]:scroll-mt-20",
  "dark:[&_.ProseMirror_blockquote]:border-white/10 dark:[&_.ProseMirror_blockquote]:border-l-primary! dark:[&_.ProseMirror_blockquote]:bg-white/[0.03] [&_.ProseMirror_blockquote_p]:before:content-none [&_.ProseMirror_blockquote_p]:after:content-none",
);

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

  if (!editor) return null;
  return (
    <div ref={ref} className={calloutClass}>
      <EditorContent editor={editor} className="min-w-0 max-w-full" />
    </div>
  );
}
