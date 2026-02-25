"use client";

import { useFeatulEditor } from "@featul/editor";
import type { JSONContent } from "@tiptap/core";
import { EditorContent } from "@tiptap/react";
import { cn } from "@featul/ui/lib/utils";

interface ChangelogRendererProps {
  content: JSONContent | null;
  className?: string;
}

export function ChangelogRenderer({
  content,
  className,
}: ChangelogRendererProps) {
  const editor = useFeatulEditor({
    content,
    editable: false,
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none prose-a:cursor-pointer prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:decoration-primary/40 hover:prose-a:decoration-primary [&_a[href*='github.com']]:text-primary [&_a[href*='github.com']]:rounded [&_a[href*='github.com']]:bg-primary/5 [&_a[href*='github.com']]:px-1 [&_a[href*='github.com']]:py-0.5 [&_a[href*='github.com']]:font-semibold",
          className,
        ),
      },
    },
  });

  if (!editor) {
    return null;
  }

  return <EditorContent editor={editor as any} />;
}
