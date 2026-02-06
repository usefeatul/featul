"use client";

import {
  EditorBubbleMenu,
  EditorClearFormatting,
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
  EditorSelector,
  EditorTableMenus,
  useCurrentEditor,
  useFeatulEditor as usefeatulEditor,
  type JSONContent,
} from "@featul/editor";
import { EditorContent as TiptapEditorContent } from "@tiptap/react";
import {
  forwardRef,
  type ForwardedRef,
  useImperativeHandle,
} from "react";

/**
 * Feed Editor Menus and Content
 *
 * This component provides the editor menus (bubble menu, table menus) and content.
 * It relies on the editor instance from context (EditorContext / useFeatulEditor).
 */
function FeedEditorMenus() {
  const { editor } = useCurrentEditor();

  if (!editor) {
    return null;
  }

  return (
    <>
      <EditorBubbleMenu>
        <EditorSelector title="Text">
          <EditorNodeText />
          <EditorNodeHeading1 />
          <EditorNodeHeading2 />
          <EditorNodeHeading3 />
          <EditorNodeBulletList />
          <EditorNodeOrderedList />
          <EditorNodeTaskList />
          <EditorNodeQuote />
          <EditorNodeCode />
        </EditorSelector>

        <EditorSelector title="Format">
          <EditorMarkBold />
          <EditorMarkItalic />
          <EditorMarkUnderline />
          <EditorMarkStrike />
          <EditorMarkCode />
          <EditorMarkSuperscript />
          <EditorMarkSubscript />
        </EditorSelector>

        <EditorMarkTextColor />
        <EditorMarkHighlight />

        <EditorLinkSelector />

        <EditorClearFormatting />
      </EditorBubbleMenu>

      <div className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[200px]">
        <TiptapEditorContent editor={editor as any} />
      </div>

      <EditorTableMenus />
    </>
  );
}

export interface FeedEditorRef {
  focus: () => void;
  getContent: () => JSONContent | undefined;
  getMarkdown: () => string | undefined;
  setContentFromMarkdown: (markdown: string) => void;
}

export interface FeedEditorProps {
  initialContent?: JSONContent;
  placeholder?: string;
  className?: string;
  onUpdate?: (content: JSONContent) => void;
  editable?: boolean;
  /** Upload handler for images (slash command, drag & drop, paste) */
  onImageUpload?: (file: File) => Promise<string>;
}

/**
 * FeedEditor
 *
 * Editor wrapper used by the changelog pages.
 * Exposes an imperative ref with `focus` and `getContent`.
 */
export const FeedEditor = forwardRef(
  (
    {
      initialContent,
      placeholder = 'start typing or press "/" for command',
      className,
      onUpdate,
      editable = true,
      onImageUpload,
    }: FeedEditorProps,
    ref: ForwardedRef<FeedEditorRef>
  ) => {
    const editor = usefeatulEditor({
      content: initialContent,
      placeholder,
      editable,
      imageUpload: onImageUpload ? { upload: onImageUpload } : undefined,
      onUpdate: ({ editor }) => {
        onUpdate?.(editor.getJSON());
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        focus: () => {
          editor?.chain().focus().run();
        },
        getContent: () => editor?.getJSON(),
        getMarkdown: () => editor?.getMarkdown(),
        setContentFromMarkdown: (markdown: string) => {
          if (!editor) return;
          editor.commands.setContent(markdown, { contentType: "markdown" });
        },
      }),
      [editor]
    );

    if (!editor) {
      return null;
    }

    return (
      <EditorContext.Provider value={{ editor }}>
        <div className={className}>
          <FeedEditorMenus />
        </div>
      </EditorContext.Provider>
    );
  }
);

FeedEditor.displayName = "FeedEditor";

export default FeedEditor;

