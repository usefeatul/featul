import { cn } from "@featul/ui/lib/utils";
import { generateHTML } from "@tiptap/html";
import type { JSONContent } from "@tiptap/react";
import { useMemo } from "react";
import { StaticCodeBlock } from "../extensions/code-block/code-block";
import { ExtensionKit } from "../extensions/extension-kit";

let staticExtensions: ReturnType<typeof ExtensionKit> | undefined;

/** The editor's schema, with code blocks highlighted at render time instead of by a plugin. */
function getStaticExtensions() {
	staticExtensions ??= ExtensionKit().map((extension) =>
		extension.name === "codeBlock" ? StaticCodeBlock : extension,
	);
	return staticExtensions;
}

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
			return generateHTML(content, getStaticExtensions());
		} catch {
			// Unknown nodes etc.: the editor still renders once it mounts.
			return "";
		}
	}, [content]);

	return (
		<div className="min-w-0 max-w-full">
			<div
				className={cn("tiptap ProseMirror", className)}
				// The reading-view styles (tables etc.) key off this, same as the read-only editor.
				contentEditable={false}
				// Server and browser serialize the same JSON; minor markup differences are expected.
				suppressHydrationWarning
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	);
}
