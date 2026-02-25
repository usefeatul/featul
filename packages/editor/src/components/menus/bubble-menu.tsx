import { Separator } from "@featul/ui/components/separator";
import { cn } from "@featul/ui/lib/utils";
import { useCurrentEditor } from "@tiptap/react";
import {
	BubbleMenu as TiptapBubbleMenu,
	type BubbleMenuProps as TiptapBubbleMenuProps,
} from "@tiptap/react/menus";
import { TextIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useCallback } from "react";
import { isCustomNodeSelected, isTextSelected } from "../../lib/utils";

export type EditorBubbleMenuProps = Omit<TiptapBubbleMenuProps, "editor">;

/**
 * Bubble Menu Component
 *
 * A floating menu that appears when text is selected in the editor.
 * Displays formatting options like text styles, marks, and other tools.
 * Automatically positions itself above the selected text using Floating UI.
 *
 * The menu will not appear when custom nodes (like YouTube embeds, code blocks, etc.) are selected.
 *
 * @example
 * ```tsx
 * <EditorBubbleMenu>
 *   <EditorMarkBold />
 *   <EditorMarkItalic />
 * </EditorBubbleMenu>
 * ```
 */
export const EditorBubbleMenu = ({
	className,
	children,
	shouldShow: customShouldShow,
	...props
}: EditorBubbleMenuProps) => {
	const { editor } = useCurrentEditor();

	const shouldShow = useCallback(
		(
			props: Parameters<NonNullable<TiptapBubbleMenuProps["shouldShow"]>>[0],
		) => {
			if (!editor || !props.view || editor.view.dragging) {
				return false;
			}

			// If a custom shouldShow is provided, check it first
			if (customShouldShow) {
				const customResult = customShouldShow(props);
				if (!customResult) {
					return false;
				}
			}

			const fromPos = props.from ?? 0;
			const domAtPos = props.view.domAtPos(fromPos).node as HTMLElement | null;
			const nodeDOM = props.view.nodeDOM(fromPos) as HTMLElement | null;
			const node = nodeDOM ?? domAtPos;

			// Don't show bubble menu if a custom node is selected
			if (isCustomNodeSelected(editor, node)) {
				return false;
			}

			// Only show if text is actually selected
			return isTextSelected({ editor });
		},
		[editor, customShouldShow],
	);

	return (
		<TiptapBubbleMenu
			className={cn(
				"p-1 bg-muted dark:bg-black rounded-2xl gap-1 shadow-none border-none",
				className,
			)}
			editor={editor ?? undefined}
			shouldShow={shouldShow}
			data-bubble-menu="true"
			{...props}
		>
			<div className="flex flex-row items-center justify-between space-y-0 pb-0 px-2 mt-0.5 py-0.5 mb-1">
				<div className="flex items-center gap-2 text-sm font-normal">
					<TextIcon className="size-3.5 text-primary" />
					Text
				</div>
			</div>
			<div className="bg-card dark:bg-background border border-border rounded-xl flex items-center gap-0.5 p-0.5">
				{children}
			</div>
		</TiptapBubbleMenu>
	);
};
