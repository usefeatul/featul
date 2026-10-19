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
					"prose prose-sm dark:prose-invert max-w-none focus:outline-none [&_a]:cursor-pointer",
					className,
				),
			},
		},
	});
	const editor = editorInstance;

	if (!editor) {
		return null;
	}

	return <EditorContent editor={editor} className="min-w-0 max-w-full" />;
}
