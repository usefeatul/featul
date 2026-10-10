import { Table as TiptapTable } from "@tiptap/extension-table";
import "../../styles/table.css";

export const Table = TiptapTable.extend({
  renderHTML(props) {
    const table = this.parent!(props);
    if (!this.editor || this.editor.isEditable) return table;

    return [
      "div",
      {
        class: "tableScroll",
        role: "region",
        "aria-label": "Table (scroll horizontally to see all columns)",
        tabindex: "0",
      },
      table,
    ];
  },
}).configure({
  resizable: true,
  lastColumnResizable: false,
});

export default Table;
