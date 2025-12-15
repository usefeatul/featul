import type { CommandItem } from "../types/blocks"

export const codeBlockCommand: CommandItem = {
  id: "codeBlock",
  title: "Code Block",
  description: "Display code with syntax highlighting",
  icon: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  command: ({ editor, range }) => {
    editor.chain().focus().deleteRange(range).setCodeBlock().run()
  },
}

