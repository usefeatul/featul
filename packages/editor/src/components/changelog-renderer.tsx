"use client";

import type { JSONContent } from "@tiptap/react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import { cn } from "@oreilla/ui/lib/utils";
import { Image } from "@tiptap/extension-image";
import { TaskList, TaskItem } from "@tiptap/extension-list";
import { Youtube } from "@tiptap/extension-youtube";
import { Table as TiptapTable } from "@tiptap/extension-table";
import { TableRow as TiptapTableRow } from "@tiptap/extension-table";
import { TableCell as TiptapTableCell } from "@tiptap/extension-table";
import { TableHeader as TiptapTableHeader } from "@tiptap/extension-table";
import { Subscript } from "@tiptap/extension-subscript";
import { Superscript } from "@tiptap/extension-superscript";
import { Highlight } from "@tiptap/extension-highlight";
import { Color } from "@tiptap/extension-color";
import { TextStyleKit } from "@tiptap/extension-text-style";

export interface ChangelogRendererProps {
  content: JSONContent;
  className?: string;
}

// Extensions needed for rendering (read-only, no interactive features)
const renderExtensions = [
  StarterKit.configure({
    codeBlock: {
      HTMLAttributes: {
        class: "rounded-md  bg-muted p-4 font-mono text-sm overflow-x-auto",
      },
    },
    bulletList: {
      HTMLAttributes: {
        class: "list-outside list-disc pl-4",
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: "list-outside list-decimal pl-4",
      },
    },
    listItem: {
      HTMLAttributes: {
        class: "leading-normal",
      },
    },
    blockquote: {
      HTMLAttributes: {
        class: "border-l border-l-2 pl-4 italic",
      },
    },
    code: {
      HTMLAttributes: {
        class: "rounded-md  bg-muted px-1.5 py-1 font-medium font-mono text-sm",
      },
    },
    horizontalRule: {
      HTMLAttributes: {
        class: "my-6 border-t border-muted-foreground/20",
      },
    },
  }),
  Image.configure({
    inline: false,
    allowBase64: true,
    HTMLAttributes: {
      class: "rounded-lg max-w-full h-auto",
    },
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: "list-none p-0",
    },
  }),
  TaskItem.configure({
    nested: true,
    HTMLAttributes: {
      class: "flex items-start gap-2",
    },
  }),
  Youtube.configure({
    HTMLAttributes: {
      class: "w-full aspect-video rounded-lg",
    },
  }),
  TiptapTable.configure({
    HTMLAttributes: {
      class: "border-collapse table-auto w-full",
    },
  }),
  TiptapTableRow,
  TiptapTableCell.configure({
    HTMLAttributes: {
      class: "border border-muted p-2",
    },
  }),
  TiptapTableHeader.configure({
    HTMLAttributes: {
      class: "border border-muted p-2 bg-muted font-semibold",
    },
  }),
  Subscript,
  Superscript,
  Highlight.configure({ multicolor: true }),
  TextStyleKit,
  Color,
];

/**
 * ChangelogRenderer Component
 * 
 * A read-only renderer for TipTap JSON content.
 * Use this to display changelog entries, blog posts, or any rich text content.
 * 
 * @example
 * ```tsx
 * <ChangelogRenderer 
 *   content={entry.content as JSONContent}
 *   className="prose dark:prose-invert"
 * />
 * ```
 */
export function ChangelogRenderer({ content, className }: ChangelogRendererProps) {
  if (!content || !content.content?.length) {
    return null;
  }

  try {
    const html = generateHTML(content, renderExtensions);

    return (
      <div
        className={cn(
          "prose prose-neutral dark:prose-invert max-w-none",
          // Heading styles
          "[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:tracking-tight [&_h1]:mb-4",
          "[&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:mb-3 [&_h2]:mt-8",
          "[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:mb-2 [&_h3]:mt-6",
          // Paragraph
          "[&_p]:leading-relaxed [&_p]:mb-4",
          // Links
          "[&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-primary/80",
          // Images
          "[&_img]:rounded-lg [&_img]:my-6",
          // Code blocks
          "[&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_pre]:overflow-x-auto",
          "[&_code]:text-sm",
          className
        )}
        // biome-ignore lint/security/noDangerouslySetInnerHtml: HTML is generated from trusted TipTap content
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  } catch (error) {
    console.error("Failed to render changelog content:", error);
    return (
      <div className="text-muted-foreground text-sm">
        Failed to render content
      </div>
    );
  }
}

export default ChangelogRenderer;

