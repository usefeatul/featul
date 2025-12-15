import { Button } from "@oreilla/ui/components/button";
import { cn } from "@oreilla/ui/lib/utils";
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
}: EditorButtonProps) => (
  <Button
    className={cn(
      "flex items-center justify-center gap-2 h-8 px-2",
      hideName ? "w-8" : "w-auto min-w-[80px]",
      isActive() && "bg-primary/10 text-primary hover:bg-primary/20"
    )}
    onClick={() => command()}
    size="sm"
    variant="ghost"
  >
    <Icon
      className={cn(
        "shrink-0",
        isActive() ? "text-primary" : "text-muted-foreground"
      )}
      size={14}
    />
    {!hideName && (
      <span className="text-xs whitespace-nowrap">{name}</span>
    )}
    {isActive() && (
      <CheckIcon className="shrink-0 text-primary" size={12} />
    )}
  </Button>
);

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
