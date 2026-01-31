"use client";

import { useFeatulEditor } from "@featul/editor";
import { EditorContent } from "@tiptap/react";
import { cn } from "@featul/ui/lib/utils";

interface ChangelogRendererProps {
    content: any; // JSON content
    className?: string;
}

export function ChangelogRenderer({ content, className }: ChangelogRendererProps) {
    const editor = useFeatulEditor({
        content,
        editable: false,
        editorProps: {
            attributes: {
                class: cn("prose prose-sm dark:prose-invert max-w-none focus:outline-none", className),
            },
        },
    });

    if (!editor) {
        return null;
    }

    return <EditorContent editor={editor as any} />;
}
