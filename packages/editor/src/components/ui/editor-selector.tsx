import { Button } from "@featul/ui/components/button";
import {
	Popover,
	PopoverContent,
	PopoverList,
	PopoverListItem,
	PopoverTrigger,
} from "@featul/ui/components/popover";
import { overlayInnerClass, overlayDialogClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import { useCurrentEditor } from "@tiptap/react";
import { ChevronDownIcon } from "lucide-react";
import type { HTMLAttributes, ReactNode } from "react";
import { useState } from "react";

export type EditorSelectorProps = HTMLAttributes<HTMLDivElement> & {
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	title: string;
	children?: ReactNode;
};

/**
 * Editor Selector Component
 *
 * A popover-based selector that groups related editor buttons together.
 * Displays a button with a title and dropdown arrow that opens a popover
 * containing child components (typically editor node or mark buttons).
 * Designed to work within the bubble menu context.
 *
 * @example
 * ```tsx
 * <EditorSelector title="Text">
 *   <EditorNodeHeading1 />
 *   <EditorNodeHeading2 />
 *   <EditorNodeHeading3 />
 * </EditorSelector>
 * ```
 */
export const EditorSelector = ({
	open: controlledOpen,
	onOpenChange: controlledOnOpenChange,
	title,
	className,
	children,
	...props
}: EditorSelectorProps) => {
	const { editor } = useCurrentEditor();
	const [internalOpen, setInternalOpen] = useState(false);

	const open = controlledOpen ?? internalOpen;
	const onOpenChange = controlledOnOpenChange ?? setInternalOpen;

	if (!editor) {
		return null;
	}

	return (
		<Popover open={open} onOpenChange={onOpenChange} modal={false}>
			<PopoverTrigger asChild>
				<Button
					className={cn(
						"flex h-8.5 items-center justify-center gap-1.5 rounded-md px-2.5",
						open
							? "bg-muted text-foreground"
							: "text-muted-foreground hover:bg-muted hover:text-foreground",
					)}
					size="sm"
					type="button"
					variant="plain"
					onClick={(e) => {
						e.stopPropagation();
						onOpenChange(!open);
					}}
				>
					<span className="whitespace-nowrap text-sm leading-none font-medium">
						{title}
					</span>
					<ChevronDownIcon
						className="shrink-0 text-muted-foreground"
						size={14}
					/>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				unstyled
				align="start"
				className={cn(
					overlayDialogClass,
					"z-[100] flex w-fit min-w-0 flex-col text-popover-foreground outline-hidden [&_[data-slot=button]]:!rounded-none",
					"data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
					className,
				)}
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
				{...props}
			>
				<div className={cn(overlayInnerClass, "p-1")}>
				<PopoverList>
					{Array.isArray(children)
						? children.map((child, index) => (
								<PopoverListItem
									key={index}
									as="div"
									className="p-0 bg-transparent hover:bg-transparent dark:hover:bg-transparent [&>span]:hidden"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										onOpenChange(false);
									}}
								>
									{child}
								</PopoverListItem>
							))
						: children && (
								<PopoverListItem
									as="div"
									className="p-0 bg-transparent hover:bg-transparent dark:hover:bg-transparent [&>span]:hidden"
									onClick={(e: React.MouseEvent) => {
										e.stopPropagation();
										onOpenChange(false);
									}}
								>
									{children}
								</PopoverListItem>
							)}
				</PopoverList>
				</div>
			</PopoverContent>
		</Popover>
	);
};
