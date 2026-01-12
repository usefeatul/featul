// Components
/** biome-ignore-all lint/performance/noBarrelFile: <> */

// Utility Components
export {
  EditorCharacterCount,
  type EditorCharacterCountProps,
} from "./editor-character-count";
export { EditorContent } from "./editor-content";
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
  EditorFloatingMenu,
  type EditorFloatingMenuProps,
} from "./menus";
// Node Components
export * from "./nodes";
export * from "./ui";

// Legacy-compatible components (for migration from editorold)

export {
  ChangelogRenderer,
  type ChangelogRendererProps,
} from "./changelog-renderer";
export * from "./icons";
