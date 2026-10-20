import { cn } from "@featul/ui/lib/utils";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import { useMemo } from "react";
import { ExtensionKit } from "../extensions/extension-kit";

export type EditorStaticContentProps = {
	content: JSONContent | null;
	/** Same class the editor puts on its root, so the content design applies unchanged. */
	className?: string;
};

/**
 * Server-renderable stand-in for a read-only editor. The editor only mounts after hydration,
 * so render this until it exists: the content is in the initial HTML instead of popping in.
 */
export function EditorStaticContent({ content, className }: EditorStaticContentProps) {
	const html = useMemo(() => {
		if (!content) return "";
		try {
			return generateHTML(content, ExtensionKit());
		} catch {
			// Unknown nodes etc.: the editor still renders once it mounts.
			return "";
		}
	}, [content]);

	return (
		<div className="min-w-0 max-w-full">
			<div
				className={cn("tiptap ProseMirror", className)}
				// Server and browser serialize the same JSON; minor markup differences are expected.
				suppressHydrationWarning
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
}
