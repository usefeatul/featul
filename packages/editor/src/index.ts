export type { Editor, JSONContent } from "@tiptap/react";
export type {
  EditorBubbleMenuProps,
  EditorLinkSelectorProps,
  EditorMarkBoldProps,
  EditorMarkCodeProps,
  EditorMarkHighlightProps,
  EditorMarkItalicProps,
  EditorMarkStrikeProps,
  EditorMarkSubscriptProps,
  EditorMarkSuperscriptProps,
  EditorMarkTextColorProps,
  EditorMarkUnderlineProps,
  EditorNodeBulletListProps,
  EditorNodeCodeProps,
  EditorNodeHeading1Props,
  EditorNodeHeading2Props,
  EditorNodeHeading3Props,
  EditorNodeOrderedListProps,
  EditorNodeQuoteProps,
  EditorNodeTaskListProps,
  EditorNodeTextProps,
  EditorProviderProps,
  EditorSelectorProps,
<<<<<<< HEAD
<<<<<<< HEAD
  useFeatulEditorOptions,
=======
  UseMarbleEditorOptions,
<<<<<<< HEAD
  // Legacy-compatible types
>>>>>>> d1482aa1 (refactor(editor): remove unused components and clean up exports)
=======
>>>>>>> 7c0fb29d (refactor(editor): consolidate icons and restructure barrel files)
=======
  useFeatulEditorOptions,
>>>>>>> 581fe1a9 (refactor: flatten barrel files to direct imports for better tree shaking)
} from "./components";
export {
  EditorBubbleMenu,
  EditorContext,
  EditorLinkSelector,
  EditorMarkBold,
  EditorMarkCode,
  EditorMarkHighlight,
  EditorMarkItalic,
  EditorMarkStrike,
  EditorMarkSubscript,
  EditorMarkSuperscript,
  EditorMarkTextColor,
  EditorMarkUnderline,
  EditorNodeBulletList,
  EditorNodeCode,
  EditorNodeHeading1,
  EditorNodeHeading2,
  EditorNodeHeading3,
  EditorNodeOrderedList,
  EditorNodeQuote,
  EditorNodeTaskList,
  EditorNodeText,
  EditorProvider,
  EditorSelector,
  EditorTableMenus,
  useCurrentEditor,
  useEditor,
<<<<<<< HEAD
<<<<<<< HEAD
  useFeatulEditor,
=======
  useMarbleEditor,
<<<<<<< HEAD
  // Legacy-compatible components (for migration from editorold)
>>>>>>> d1482aa1 (refactor(editor): remove unused components and clean up exports)
=======
>>>>>>> 7c0fb29d (refactor(editor): consolidate icons and restructure barrel files)
=======
  useFeatulEditor,
>>>>>>> 581fe1a9 (refactor: flatten barrel files to direct imports for better tree shaking)
} from "./components";
export {
  BubbleMenuButton,
  EditorClearFormatting,
  type EditorClearFormattingProps,
} from "./components/ui/editor-button";

export {
  CodeBlock,
  configureSlashCommand,
  Figure,
  handleCommandNavigation,
  ImageUpload,
  SlashCommand,
  Table,
  TableCell,
  TableColumnMenu,
  TableHeader,
  TableRow,
  TableRowMenu,
} from "./extensions";
export type { ExtensionKitOptions } from "./extensions";
export { ExtensionKit } from "./extensions";
<<<<<<< HEAD
<<<<<<< HEAD
export { lowlight } from "./lib/lowlight";
=======
export { lowlight } from "./lib";
>>>>>>> 7c0fb29d (refactor(editor): consolidate icons and restructure barrel files)
=======
export { lowlight } from "./lib/lowlight";
>>>>>>> 581fe1a9 (refactor: flatten barrel files to direct imports for better tree shaking)
export type {
  EditorButtonProps,
  EditorIcon,
  EditorSlashMenuProps,
  ImageUploadOptions,
  MediaItem,
  SlashNodeAttrs,
  SuggestionItem,
} from "./types";
