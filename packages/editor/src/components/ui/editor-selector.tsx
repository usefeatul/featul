import { Button } from "@oreilla/ui/components/button";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@oreilla/ui/components/popover";
import { cn } from "@oreilla/ui/lib/utils";
import { useCurrentEditor } from "@tiptap/react";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

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
            "flex items-center justify-center gap-1.5 h-8 px-2 rounded-md",
            open && "bg-primary/10 text-primary hover:bg-primary/20"
          )}
          size="sm"
          type="button"
          variant="ghost"
          onClick={(e) => {
            e.stopPropagation();
            onOpenChange(!open);
          }}
        >
          <span className="whitespace-nowrap text-xs font-medium">{title}</span>
          <ChevronDownIcon 
            className={cn(
              "shrink-0 transition-transform text-muted-foreground",
              open && "rotate-180"
            )}
            size={12} 
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={cn("w-56 p-0 z-[100]", className)}
        list={true}
        side="bottom"
        sideOffset={8}
        onInteractOutside={(e) => {
          // Don't close if clicking on bubble menu
          const bubbleMenu = (e.target as Element).closest('[data-bubble-menu]');
          if (bubbleMenu) {
            e.preventDefault();
          }
        }}
        {...props}
      >
        <PopoverList>
          {Array.isArray(children)
            ? children.map((child, index) => (
                <PopoverListItem
                  key={index}
                  as="div"
                  className="flex items-center gap-3 px-3 py-2"
                  onClick={(e) => {
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
                  className="flex items-center gap-3 px-3 py-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenChange(false);
                  }}
                >
                  {children}
                </PopoverListItem>
              )}
        </PopoverList>
      </PopoverContent>
    </Popover>
  );
};
