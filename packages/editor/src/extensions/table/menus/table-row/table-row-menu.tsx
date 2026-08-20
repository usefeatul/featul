import { Button } from "@featul/ui/components/button";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import type { EditorState } from "@tiptap/pm/state";
import type { EditorView } from "@tiptap/pm/view";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { ArrowDownIcon, ArrowUpIcon, Trash2Icon } from "lucide-react";
import { type JSX, memo, useCallback } from "react";
import { isRowGripSelected } from "./utils";

type MenuProps = {
  editor: Editor;
  appendTo?: React.RefObject<HTMLElement>;
};

type ShouldShowProps = {
  view: EditorView;
  state: EditorState;
  from: number;
};

function TableRowMenuComponent({ editor, appendTo }: MenuProps): JSX.Element {
  const shouldShow = useCallback(
    ({ view, state, from }: ShouldShowProps) => {
      if (!state || !from) {
        return false;
      }

      return isRowGripSelected({ editor, view, state, from } as Parameters<
        typeof isRowGripSelected
      >[0]);
    },
    [editor]
  );

  const onAddRowBefore = useCallback(() => {
    editor.chain().focus().addRowBefore().run();
  }, [editor]);

  const onAddRowAfter = useCallback(() => {
    editor.chain().focus().addRowAfter().run();
  }, [editor]);

  const onDeleteRow = useCallback(() => {
    editor.chain().focus().deleteRow().run();
  }, [editor]);

  return (
    <TiptapBubbleMenu
      appendTo={() => appendTo?.current ?? document.body}
      className={cn(overlayDialogClass, "flex flex-col gap-2")}
      editor={editor}
      options={{
        placement: "left",
        offset: { mainAxis: 24, crossAxis: 0 },
      }}
      pluginKey="tableRowMenu"
      shouldShow={shouldShow}
      updateDelay={0}
    >
      <div className="flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
        Row
      </div>
      <div className={cn(overlayInnerClass, "flex flex-col p-1")}>
      <Button
        className="justify-start gap-2"
        onClick={onAddRowBefore}
        size="sm"
        type="button"
        variant="plain"
      >
        <ArrowUpIcon className="size-4" />
        <span>Add row before</span>
      </Button>

      <Button
        className="justify-start gap-2"
        onClick={onAddRowAfter}
        size="sm"
        type="button"
        variant="plain"
      >
        <ArrowDownIcon className="size-4" />
        <span>Add row after</span>
      </Button>

      <Button
        className="justify-start gap-2"
        onClick={onDeleteRow}
        size="sm"
        type="button"
        variant="plain"
      >
        <Trash2Icon className="size-4" />
        <span>Delete row</span>
      </Button>
      </div>
    </TiptapBubbleMenu>
  );
}

export const TableRowMenu = memo(TableRowMenuComponent);
TableRowMenu.displayName = "TableRowMenu";

export default TableRowMenu;
