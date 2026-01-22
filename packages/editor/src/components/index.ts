// Components
/** biome-ignore-all lint/performance/noBarrelFile: <> */

// Utility Components

export {
  EditorContext,
  EditorProvider,
  type EditorProviderProps,
  type UseMarbleEditorOptions,
  useCurrentEditor,
  useEditor,
  useMarbleEditor,
} from "./editor-provider";
export { EditorTableMenus } from "./editor-table-menus";
// Mark Components
export * from "./marks";
export {
  EditorBubbleMenu,
  type EditorBubbleMenuProps,
} from "./menus";
// Node Components
export * from "./nodes";
export * from "./ui";

// Legacy-compatible components (for migration from editorold)


export * from "./icons";
