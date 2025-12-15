"use client"

import * as React from "react"
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Underline from "@tiptap/extension-underline"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import { common, createLowlight } from "lowlight"

import { SlashCommands, slashCommandsSuggestion } from "../extensions/slash-commands"
import { Callout } from "../extensions/callout"
import { CustomImage } from "../extensions/image"
import { SlashMenu } from "./slash-menu"
import { BubbleMenuBar } from "./bubble-menu"
import { Toolbar } from "./toolbar"
import { cn } from "../lib/utils"

const lowlight = createLowlight(common)

export type ChangelogContent = JSONContent

export interface ChangelogEditorProps {
  content?: ChangelogContent
  onChange?: (content: ChangelogContent) => void
  onUpdate?: (props: { editor: ReturnType<typeof useEditor> }) => void
  placeholder?: string
  editable?: boolean
  showToolbar?: boolean
  className?: string
  editorClassName?: string
  autofocus?: boolean
}

export function ChangelogEditor({
  content,
  onChange,
  onUpdate,
  placeholder = "Type '/' for commands...",
  editable = true,
  showToolbar = true,
  className,
  editorClassName,
  autofocus = false,
}: ChangelogEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return `Heading ${node.attrs.level}`
          }
          return placeholder
        },
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline underline-offset-4",
        },
      }),
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      Underline,
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: "javascript",
      }),
      CustomImage,
      Callout,
      SlashCommands.configure({
        suggestion: slashCommandsSuggestion(SlashMenu),
      }),
    ],
    content,
    editable,
    autofocus,
    editorProps: {
      attributes: {
        class: cn(
          "tiptap-editor prose prose-neutral dark:prose-invert max-w-none focus:outline-none",
          editorClassName
        ),
      },
    },
    onUpdate: ({ editor }) => {
      const json = editor.getJSON()
      onChange?.(json)
      onUpdate?.({ editor: editor as ReturnType<typeof useEditor> })
    },
  })

  return (
    <div className={cn("flex flex-col rounded-lg border border-border bg-background", className)}>
      {showToolbar && editable && <Toolbar editor={editor} />}
      <div className="p-4">
        {editor && editable && <BubbleMenuBar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}

