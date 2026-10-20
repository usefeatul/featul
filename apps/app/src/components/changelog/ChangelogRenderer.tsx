"use client";

import { EditorContent, EditorStaticContent, useFeatulEditor, type JSONContent } from "@featul/editor";
import { cn } from "@featul/ui/lib/utils";

interface ChangelogRendererProps {
	content: JSONContent | null;
	className?: string;
}

export function ChangelogRenderer({
	content,
	className,
}: ChangelogRendererProps) {
	const proseClass = cn(
		"prose prose-sm dark:prose-invert max-w-none focus:outline-none [&_a]:cursor-pointer",
		className,
	);
	const editor = useFeatulEditor({
		content,
		editable: false,
		editorProps: { attributes: { class: proseClass } },
	});

	// The editor mounts after hydration; the static render keeps the content in the first paint.
	if (!editor) {
		return <EditorStaticContent content={content} className={proseClass} />;
	}

	return <EditorContent editor={editor} className="min-w-0 max-w-full" />;
}
