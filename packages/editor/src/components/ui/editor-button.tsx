import { Button } from "@featul/ui/components/button";
import { cn } from "@featul/ui/lib/utils";
import { useCurrentEditor } from "@tiptap/react";
import { CheckIcon, RemoveFormattingIcon } from "lucide-react";
import type { EditorButtonProps } from "../../types";

/**
 * Base Button Component for Editor Toolbar
 * Used in BubbleMenu and other UI components
 */
export const BubbleMenuButton = ({
	name,
	isActive,
	command,
	icon: Icon,
	hideName,
}: EditorButtonProps) => {
	return (
		<Button
			className={cn(
				"flex h-8.5 items-center gap-1.5 px-2.5 text-xs font-medium",
				hideName
					? "w-8.5 justify-center px-0 rounded-md"
					: "w-full justify-between rounded-none",
				isActive()
					? "text-foreground"
					: "text-muted-foreground hover:text-foreground",
			)}
			onClick={() => command()}
			size="sm"
			variant="plain"
		>
			<Icon
				className={cn(
					"shrink-0",
					isActive() ? "text-foreground" : "text-muted-foreground",
				)}
				size={14}
			/>
			{!hideName && <span className="truncate flex-1 text-left">{name}</span>}
			{isActive() && !hideName && (
				<CheckIcon className="shrink-0 text-blue-600 ml-auto" size={14} />
			)}
		</Button>
	);
};

/**
 * Clear Formatting Button
 *
 * Button that removes all formatting (marks and node styles) from the selected text.
 * Resets the selection to plain text/paragraph format.
 *
 * @example
 * ```tsx
 * <EditorClearFormatting />
 * <EditorClearFormatting hideName />
 * ```
 */
export type EditorClearFormattingProps = Pick<EditorButtonProps, "hideName">;

export const EditorClearFormatting = ({
	hideName = true,
}: EditorClearFormattingProps) => {
	const { editor } = useCurrentEditor();

	if (!editor) {
		return null;
	}

	return (
		<BubbleMenuButton
			command={() => editor.chain().focus().clearNodes().unsetAllMarks().run()}
			hideName={hideName}
			icon={RemoveFormattingIcon}
			isActive={() => false}
			name="Clear Formatting"
		/>
	);
};
