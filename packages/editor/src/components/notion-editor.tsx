"use client";

import {
  forwardRef,
  useImperativeHandle,
  type ForwardedRef,
} from "react";
import type { JSONContent } from "@tiptap/react";
import { EditorContent as TiptapEditorContent } from "@tiptap/react";
import { EditorContext, useMarbleEditor } from "./editor-provider";
import { EditorBubbleMenu } from "./menus/bubble-menu";
import { EditorMarkBold } from "./marks/editor-mark-bold";
import { EditorMarkItalic } from "./marks/editor-mark-italic";
import { EditorMarkStrike } from "./marks/editor-mark-strike";
import { EditorMarkCode } from "./marks/editor-mark-code";
import { EditorMarkHighlight } from "./marks/editor-mark-highlight";
import { EditorMarkTextColor } from "./marks/editor-mark-text-color";
import { EditorLinkSelector } from "./marks/editor-link-selector";
import { EditorSelector } from "./ui/editor-selector";
import { EditorNodeText } from "./nodes/editor-node-text";
import { EditorNodeHeading1 } from "./nodes/editor-node-heading1";
import { EditorNodeHeading2 } from "./nodes/editor-node-heading2";
import { EditorNodeHeading3 } from "./nodes/editor-node-heading3";
import { EditorNodeBulletList } from "./nodes/editor-node-bullet-list";
import { EditorNodeOrderedList } from "./nodes/editor-node-ordered-list";
import { EditorNodeQuote } from "./nodes/editor-node-quote";
import { EditorNodeCode } from "./nodes/editor-node-code";
import "../styles/editor.css";

export interface NotionEditorRef {
  focus: () => void;
  getContent: () => JSONContent | undefined;
  getHTML: () => string | undefined;
  getText: () => string | undefined;
}

export interface NotionEditorProps {
  initialContent?: JSONContent;
  placeholder?: string;
  className?: string;
  onUpdate?: (content: JSONContent) => void;
  editable?: boolean;
}

/**
 * NotionEditor Component
 * 
 * A Notion-style block editor with slash commands, bubble menu, and rich text formatting.
 * Compatible with the old editorold API for easy migration.
 * 
 * @example
 * ```tsx
 * const editorRef = useRef<NotionEditorRef>(null);
 * 
 * <NotionEditor 
 *   ref={editorRef}
 *   initialContent={content}
 *   placeholder="Start typing..."
 *   onUpdate={(content) => console.log(content)}
 * />
 * 
 * // Get content
 * const content = editorRef.current?.getContent();
 * ```
 */
export const NotionEditor = forwardRef<NotionEditorRef, NotionEditorProps>(
  function NotionEditor(
    { initialContent, placeholder = 'start typing or press "/" for command', className, onUpdate, editable = true },
    ref: ForwardedRef<NotionEditorRef>
  ) {
    const editor = useMarbleEditor({
      content: initialContent,
      placeholder,
      editable,
      onUpdate: ({ editor }) => {
        onUpdate?.(editor.getJSON());
      },
    });

    useImperativeHandle(ref, () => ({
      focus: () => {
        editor?.chain().focus().run();
      },
      getContent: () => {
        return editor?.getJSON();
      },
      getHTML: () => {
        return editor?.getHTML();
      },
      getText: () => {
        return editor?.getText();
      },
    }));

    if (!editor) {
      return null;
    }

    return (
      <EditorContext.Provider value={{ editor }}>
        <div className={`border-none outline-none ${className || ""}`}>
          <EditorBubbleMenu>
            <EditorSelector title="Text">
              <EditorNodeText />
              <EditorNodeHeading1 />
              <EditorNodeHeading2 />
              <EditorNodeHeading3 />
              <EditorNodeBulletList />
              <EditorNodeOrderedList />
              <EditorNodeQuote />
              <EditorNodeCode />
            </EditorSelector>
            <EditorMarkBold hideName />
            <EditorMarkItalic hideName />
            <EditorMarkStrike hideName />
            <EditorMarkCode hideName />
            <EditorMarkHighlight hideName />
            <EditorMarkTextColor hideName />
            <EditorLinkSelector />
          </EditorBubbleMenu>
          <TiptapEditorContent 
            editor={editor} 
            className="prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[200px]"
          />
        </div>
      </EditorContext.Provider>
    );
  }
);

export default NotionEditor;

