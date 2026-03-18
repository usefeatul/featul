"use client";

import { EditorContent, useFeatulEditor, type JSONContent } from "@featul/editor";
import { cn } from "@featul/ui/lib/utils";

interface ChangelogRendererProps {
	content: JSONContent | null;
	className?: string;
}

export function ChangelogRenderer({
	content,
	className,
}: ChangelogRendererProps) {
	const editorInstance = useFeatulEditor({
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
	const editor = editorInstance;

	if (!editor) {
		return null;
	}

	return <EditorContent editor={editor} />;
}
