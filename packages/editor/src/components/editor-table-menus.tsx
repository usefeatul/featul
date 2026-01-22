import { useCurrentEditor } from "@tiptap/react";
import { TableColumnMenu } from "../extensions/table/menus/table-column/table-column-menu";
import { TableRowMenu } from "../extensions/table/menus/table-row/table-row-menu";

export function EditorTableMenus() {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <>
      <TableRowMenu editor={editor} />
      <TableColumnMenu editor={editor} />
    </>
  );
}
