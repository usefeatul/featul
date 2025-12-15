"use client"

import { useCallback, useEffect, useRef, useState, forwardRef, useImperativeHandle } from "react"
import { useEditor, EditorContent, type Editor, type JSONContent, ReactRenderer } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Placeholder from "@tiptap/extension-placeholder"
import Link from "@tiptap/extension-link"
import TaskList from "@tiptap/extension-task-list"
import TaskItem from "@tiptap/extension-task-item"
import Underline from "@tiptap/extension-underline"
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"
import Image from "@tiptap/extension-image"
import { Extension } from "@tiptap/core"
import Suggestion, { type SuggestionProps, type SuggestionKeyDownProps } from "@tiptap/suggestion"
import { common, createLowlight } from "lowlight"
import { cn } from "@oreilla/ui/lib/utils"
import tippy, { type Instance as TippyInstance } from "tippy.js"

const lowlight = createLowlight(common)

// Slash command items
interface CommandItem {
  title: string
  description: string
  icon: React.ReactNode
  command: (props: { editor: Editor; range: { from: number; to: number } }) => void
}

const getSuggestionItems = (): CommandItem[] => [
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: <span className="font-bold">H1</span>,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run()
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: <span className="font-bold">H2</span>,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run()
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: <span className="font-bold">H3</span>,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run()
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
      </svg>
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run()
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="10" y1="6" x2="21" y2="6"/><line x1="10" y1="12" x2="21" y2="12"/><line x1="10" y1="18" x2="21" y2="18"/>
        <path d="M4 6h1v4"/><path d="M4 10h2"/><path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>
      </svg>
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run()
    },
  },
  {
    title: "Task List",
    description: "Track tasks with checkboxes",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="5" width="6" height="6" rx="1"/><path d="m3 17 2 2 4-4"/>
        <path d="M13 6h8"/><path d="M13 12h8"/><path d="M13 18h8"/>
      </svg>
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run()
    },
  },
  {
    title: "Quote",
    description: "Capture a quote",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V21"/>
        <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3"/>
      </svg>
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run()
    },
  },
  {
    title: "Code Block",
    description: "Display code with syntax highlighting",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
      </svg>
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run()
    },
  },
  {
    title: "Image",
    description: "Embed an image from URL",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/>
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
      </svg>
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run()
      const url = window.prompt("Enter image URL")
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    },
  },
  {
    title: "Divider",
    description: "Visual divider line",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"/>
      </svg>
    ),
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run()
    },
  },
]

// Slash command menu component
interface CommandListProps {
  items: CommandItem[]
  command: (item: CommandItem) => void
}

interface CommandListRef {
  onKeyDown: (props: SuggestionKeyDownProps) => boolean
}

const CommandList = forwardRef<CommandListRef, CommandListProps>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = items[index]
    if (item) command(item)
  }

  useEffect(() => {
    setSelectedIndex(0)
  }, [items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((selectedIndex + items.length - 1) % items.length)
        return true
      }
      if (event.key === "ArrowDown") {
        setSelectedIndex((selectedIndex + 1) % items.length)
        return true
      }
      if (event.key === "Enter") {
        selectItem(selectedIndex)
        return true
      }
      return false
    },
  }))

  if (items.length === 0) {
    return (
      <div className="bg-popover border border-border rounded-lg shadow-lg p-2 text-sm text-muted-foreground">
        No results
      </div>
    )
  }

  return (
    <div className="bg-popover border border-border rounded-lg shadow-lg overflow-hidden min-w-[280px] max-h-[320px] overflow-y-auto">
      {items.map((item, index) => (
        <button
          key={item.title}
          onClick={() => selectItem(index)}
          onMouseEnter={() => setSelectedIndex(index)}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors",
            index === selectedIndex && "bg-accent"
          )}
        >
          <div className="flex items-center justify-center w-10 h-10 rounded-md bg-muted text-muted-foreground">
            {item.icon}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{item.title}</span>
            <span className="text-xs text-muted-foreground">{item.description}</span>
          </div>
        </button>
      ))}
    </div>
  )
})

CommandList.displayName = "CommandList"

// Slash commands extension
const SlashCommands = Extension.create({
  name: "slashCommands",

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        items: ({ query }) => {
          return getSuggestionItems().filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          )
        },
        render: () => {
          let component: ReactRenderer<CommandListRef> | null = null
          let popup: TippyInstance[] | null = null

          return {
            onStart: (props) => {
              component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
              })

              if (!props.clientRect) return

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
              })
            },
            onUpdate(props) {
              component?.updateProps(props)
              if (!props.clientRect) return
              popup?.[0]?.setProps({
                getReferenceClientRect: props.clientRect as () => DOMRect,
              })
            },
            onKeyDown(props) {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide()
                return true
              }
              return component?.ref?.onKeyDown(props) ?? false
            },
            onExit() {
              popup?.[0]?.destroy()
              component?.destroy()
            },
          }
        },
        command: ({ editor, range, props }) => {
          props.command({ editor, range })
        },
      }),
    ]
  },
})

// Main editor component
export interface NotionEditorProps {
  initialContent?: JSONContent
  onChange?: (content: JSONContent) => void
  className?: string
  placeholder?: string
  autofocus?: boolean
}

export interface NotionEditorRef {
  getContent: () => JSONContent
  setContent: (content: JSONContent) => void
  focus: () => void
  editor: Editor | null
}

export const NotionEditor = forwardRef<NotionEditorRef, NotionEditorProps>(
  ({ initialContent, onChange, className, placeholder = "Start writing, or press '/' for commands...", autofocus = false }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading: { levels: [1, 2, 3] },
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
        Link.configure({ openOnClick: false }),
        TaskList,
        TaskItem.configure({ nested: true }),
        Underline,
        CodeBlockLowlight.configure({ lowlight, defaultLanguage: "javascript" }),
        Image.configure({ HTMLAttributes: { class: "rounded-lg max-w-full" } }),
        SlashCommands,
      ],
      content: initialContent || { type: "doc", content: [{ type: "paragraph" }] },
      editorProps: {
        attributes: {
          class: cn(
            "prose prose-neutral dark:prose-invert max-w-none focus:outline-none min-h-[300px]",
            className
          ),
        },
      },
      autofocus,
      onUpdate: ({ editor }) => {
        onChange?.(editor.getJSON())
      },
    })

    useImperativeHandle(ref, () => ({
      getContent: () => editor?.getJSON() || { type: "doc", content: [] },
      setContent: (content) => editor?.commands.setContent(content),
      focus: () => editor?.commands.focus(),
      editor,
    }))

    return (
      <>
        <EditorContent editor={editor} />
        <style jsx global>{`
          .ProseMirror {
            min-height: 300px;
            outline: none;
          }
          .ProseMirror > * + * {
            margin-top: 0.75em;
          }
          .ProseMirror p.is-editor-empty:first-child::before {
            color: var(--muted-foreground);
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
            opacity: 0.4;
          }
          .ProseMirror h1 {
            font-size: 2em;
            font-weight: 700;
            margin-top: 1.5em;
            margin-bottom: 0.5em;
          }
          .ProseMirror h2 {
            font-size: 1.5em;
            font-weight: 600;
            margin-top: 1.25em;
            margin-bottom: 0.5em;
          }
          .ProseMirror h3 {
            font-size: 1.25em;
            font-weight: 600;
            margin-top: 1em;
            margin-bottom: 0.5em;
          }
          .ProseMirror ul,
          .ProseMirror ol {
            padding-left: 1.5em;
          }
          .ProseMirror blockquote {
            border-left: 3px solid var(--border);
            padding-left: 1em;
            color: var(--muted-foreground);
            font-style: italic;
          }
          .ProseMirror pre {
            background: #1e1e2e;
            border-radius: 0.5rem;
            padding: 1rem;
            overflow-x: auto;
          }
          .ProseMirror pre code {
            color: #cdd6f4;
            font-size: 0.875rem;
          }
          .ProseMirror code {
            background: var(--muted);
            padding: 0.125rem 0.375rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
          }
          .ProseMirror img {
            max-width: 100%;
            border-radius: 0.5rem;
            margin: 1em 0;
          }
          .ProseMirror hr {
            border: none;
            border-top: 1px solid var(--border);
            margin: 2em 0;
          }
          .ProseMirror a {
            color: var(--primary);
            text-decoration: underline;
            text-underline-offset: 2px;
          }
          .ProseMirror ul[data-type="taskList"] {
            list-style: none;
            padding-left: 0;
          }
          .ProseMirror ul[data-type="taskList"] li {
            display: flex;
            align-items: flex-start;
            gap: 0.5rem;
          }
          .ProseMirror ul[data-type="taskList"] li > label {
            flex-shrink: 0;
            margin-top: 0.25rem;
          }
          .ProseMirror ul[data-type="taskList"] li > div {
            flex: 1;
          }
        `}</style>
      </>
    )
  }
)

NotionEditor.displayName = "NotionEditor"

