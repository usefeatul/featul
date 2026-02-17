import { Button } from "@featul/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverList,
	PopoverListItem,
	PopoverTrigger,
} from "@featul/ui/components/popover";
import { cn } from "@featul/ui/lib/utils";
import { useCurrentEditor, useEditorState } from "@tiptap/react";
import { ChevronDownIcon, Highlighter } from "lucide-react";
import { useCallback, useState } from "react";
import type { EditorButtonProps } from "../../types";
import { ColorPicker } from "../color-picker";

export type EditorMarkHighlightProps = Pick<EditorButtonProps, "hideName">;

/**
 * Highlight Mark Button
 *
 * Button that opens a color picker to highlight the selected text.
 * Uses a Popover to display the ColorPicker component.
 * Active when the selection has a highlight color applied.
 * Shows "Highlight" text with chevron when hideName is false (for submenu display).
 *
 * @example
 * ```tsx
 * <EditorMarkHighlight />
 * <EditorMarkHighlight hideName />
 * ```
 */
export const EditorMarkHighlight = ({
	hideName = true,
}: EditorMarkHighlightProps) => {
	const { editor } = useCurrentEditor();
	const [open, setOpen] = useState(false);

	const currentHighlight = useEditorState({
		editor,
		selector: (ctx) =>
			ctx.editor?.getAttributes("highlight")?.color || undefined,
	});

	const isActive = Boolean(currentHighlight);

	const handleColorChange = useCallback(
		(color: string) => {
			if (!editor) {
				return;
			}
			editor.chain().focus().setHighlight({ color }).run();
		},
		[editor],
	);

	const handleClearHighlight = useCallback(() => {
		if (!editor) {
			return;
		}
		editor.chain().focus().unsetHighlight().run();
	}, [editor]);

	if (!editor) {
		return null;
	}

	// Check if Highlight extension is available
	const hasHighlightExtension = editor.can().setHighlight({ color: "#000000" });

	if (!hasHighlightExtension) {
		return null;
	}

	// If hideName is true, show icon-only button (for main bubble menu)
	if (hideName) {
		return (
			<Popover open={open} onOpenChange={setOpen} modal={false}>
				<PopoverTrigger asChild>
					<Button
						className={cn(
							"flex h-8.5 w-8.5 items-center justify-center  px-0",
							isActive && "text-primary",
						)}
						size="sm"
						type="button"
						variant="plain"
						onClick={(e) => {
							e.stopPropagation();
							setOpen(!open);
						}}
					>
						<Highlighter
							className={cn(
								"shrink-0",
								isActive ? "text-primary" : "text-muted-foreground",
							)}
							size={14}
						/>
					</Button>
				</PopoverTrigger>
				<PopoverContent
					align="start"
					className="w-80 p-0 z-[100]"
					onOpenAutoFocus={(event) => event.preventDefault()}
					side="bottom"
					sideOffset={8}
					onInteractOutside={(e) => {
						const bubbleMenu = (e.target as Element).closest(
							"[data-bubble-menu]",
						);
						if (bubbleMenu) {
							e.preventDefault();
						}
					}}
				>
					<ColorPicker
						color={currentHighlight}
						onChange={handleColorChange}
						onClear={handleClearHighlight}
					/>
				</PopoverContent>
			</Popover>
		);
	}

	// If hideName is false, show "Highlight" text with chevron (for submenu display)
	return (
		<Popover open={open} onOpenChange={setOpen} modal={false}>
			<PopoverTrigger asChild>
				<Button
					className={cn(
						"flex h-8.5 w-full items-center justify-between gap-1.5 rounded-md px-2.5",
						isActive && "text-primary",
					)}
					size="sm"
					type="button"
					variant="plain"
					onClick={(e) => {
						e.stopPropagation();
						setOpen(!open);
					}}
				>
					<div className="flex items-center gap-1">
						<Highlighter
							className={cn(
								"shrink-0",
								isActive ? "text-primary" : "text-muted-foreground",
							)}
							size={14}
						/>
						<span className="whitespace-nowrap text-xs font-medium">
							Highlight
						</span>
					</div>
					<ChevronDownIcon
						className={cn(
							"shrink-0 transition-transform text-muted-foreground",
							open && "rotate-180",
						)}
						size={12}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-80 p-0 z-[100]"
				onOpenAutoFocus={(event) => event.preventDefault()}
				side="bottom"
				sideOffset={8}
				onInteractOutside={(e) => {
					const bubbleMenu = (e.target as Element).closest(
						"[data-bubble-menu]",
					);
					if (bubbleMenu) {
						e.preventDefault();
					}
				}}
			>
				<PopoverList className="p-0">
					<PopoverListItem className="p-0">
						<ColorPicker
							color={currentHighlight}
							onChange={handleColorChange}
							onClear={handleClearHighlight}
						/>
					</PopoverListItem>
				</PopoverList>
			</PopoverContent>
		</Popover>
	);
};
