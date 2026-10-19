import React from "react";
import { cn } from "@featul/ui/lib/utils";
import { Linkify } from "@/components/post/linkify";

type Block =
  | { type: "paragraph"; text: string }
  | { type: "list"; title?: string; items: string[] };

const BULLET = /^\s*(?:[-*•]|\d+[.)])\s+/;

/** A short line with no closing punctuation reads as a label for the list after it. */
function isLabel(text: string) {
  return text.length <= 60 && !/[.!?,;]$/.test(text);
}

/** Split plain post text into paragraphs and bullet lists. */
function parseBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  for (const raw of content.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    if (BULLET.test(line)) {
      const item = line.replace(BULLET, "");
      const last = blocks[blocks.length - 1];
      if (last?.type === "list") {
        last.items.push(item);
      } else if (last?.type === "paragraph" && isLabel(last.text)) {
        blocks[blocks.length - 1] = {
          type: "list",
          title: last.text,
          items: [item],
        };
      } else {
        blocks.push({ type: "list", items: [item] });
      }
    } else {
      blocks.push({ type: "paragraph", text: line });
    }
  }
  return blocks;
}

/** Post description: paragraphs, labelled bullet lists, and clickable links. */
export function PostBody({
  content,
  className,
}: {
  content: string;
  className?: string;
}) {
  const blocks = React.useMemo(() => parseBlocks(content), [content]);

  return (
    <div
      className={cn(
        "min-w-0 space-y-4 wrap-break-word text-[15px] leading-7 text-accent",
        className,
      )}
    >
      {blocks.map((block, index) =>
        block.type === "paragraph" ? (
          <p key={index}>
            <Linkify content={block.text} />
          </p>
        ) : (
          <div key={index} className="space-y-1.5">
            {block.title ? (
              <p className="text-sm font-semibold text-foreground">
                {block.title}
              </p>
            ) : null}
            <ul className="space-y-1">
              {block.items.map((item, i) => (
                <li key={i} className="flex gap-3">
                  <span
                    aria-hidden
                    className="mt-[0.8rem] size-1 shrink-0 rounded-full bg-foreground/40"
                  />
                  <span className="min-w-0">
                    <Linkify content={item} />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ),
      )}
    </div>
  );
}
