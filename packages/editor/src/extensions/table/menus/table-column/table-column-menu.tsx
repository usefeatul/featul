import { Button } from "@featul/ui/components/button";
import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay";
import { cn } from "@featul/ui/lib/utils";
import type { Editor } from "@tiptap/react";
import { BubbleMenu as TiptapBubbleMenu } from "@tiptap/react/menus";
import { ArrowLeftIcon, ArrowRightIcon, Trash2Icon } from "lucide-react";
import { type JSX, memo, useCallback } from "react";
import { isColumnGripSelected } from "./utils";

type MenuProps = {
  editor: Editor;
  appendTo?: React.RefObject<HTMLElement>;
};

type ShouldShowProps = {
  view: unknown;
  state: unknown;
  from: number;
};

function TableColumnMenuComponent({
  editor,
  appendTo,
}: MenuProps): JSX.Element {
  const shouldShow = useCallback(
    ({ view, state, from }: ShouldShowProps) => {
      if (!state) {
        return false;
      }

      return isColumnGripSelected({
        editor,
        view,
        state,
        from: from || 0,
      } as Parameters<typeof isColumnGripSelected>[0]);
    },
    [editor]
  );

  const onAddColumnBefore = useCallback(() => {
    editor.chain().focus().addColumnBefore().run();
  }, [editor]);

  const onAddColumnAfter = useCallback(() => {
    editor.chain().focus().addColumnAfter().run();
  }, [editor]);

  const onDeleteColumn = useCallback(() => {
    editor.chain().focus().deleteColumn().run();
  }, [editor]);

  return (
    <TiptapBubbleMenu
      appendTo={() => appendTo?.current ?? document.body}
      className={cn(overlayDialogClass, "flex flex-col gap-2")}
      editor={editor}
      options={{
        placement: "top",
        offset: { mainAxis: 24, crossAxis: 0 },
      }}
      pluginKey="tableColumnMenu"
      shouldShow={shouldShow}
      updateDelay={0}
    >
      <div className="flex items-center gap-2 px-2 py-0.5 text-sm font-normal">
        Column
      </div>
      <div className={cn(overlayInnerClass, "flex flex-col p-1")}>
      <Button
        className="w-full justify-start gap-2"
        onClick={onAddColumnBefore}
        size="sm"
        type="button"
        variant="plain"
      >
        <ArrowLeftIcon className="size-4" />
        <span>Add column before</span>
      </Button>

      <Button
        className="w-full justify-start gap-2"
        onClick={onAddColumnAfter}
        size="sm"
        type="button"
        variant="plain"
      >
        <ArrowRightIcon className="size-4" />
        <span>Add column after</span>
      </Button>

      <Button
        className="w-full justify-start gap-2"
        onClick={onDeleteColumn}
        size="sm"
        type="button"
        variant="plain"
      >
        <Trash2Icon className="size-4" />
        <span>Delete column</span>
      </Button>
      </div>
    </TiptapBubbleMenu>
  );
}

export const TableColumnMenu = memo(TableColumnMenuComponent);
TableColumnMenu.displayName = "TableColumnMenu";

export default TableColumnMenu;
