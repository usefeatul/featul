import { Node, mergeAttributes } from "@tiptap/core"

export type CalloutType = "info" | "warning" | "success" | "error"

export interface CalloutOptions {
  HTMLAttributes: Record<string, unknown>
  types: CalloutType[]
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    callout: {
      setCallout: (attributes: { type: CalloutType }) => ReturnType
      toggleCallout: (attributes: { type: CalloutType }) => ReturnType
      unsetCallout: () => ReturnType
    }
  }
}

const calloutIcons: Record<CalloutType, string> = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  error: "❌",
}

export const Callout = Node.create<CalloutOptions>({
  name: "callout",

  addOptions() {
    return {
      HTMLAttributes: {},
      types: ["info", "warning", "success", "error"],
    }
  },

  content: "block+",

  group: "block",

  defining: true,

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (element) => element.getAttribute("data-type") || "info",
        renderHTML: (attributes) => ({
          "data-type": attributes.type,
        }),
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="callout"]',
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type as CalloutType
    const icon = calloutIcons[type] || calloutIcons.info

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "callout",
        class: `callout ${type}`,
      }),
      [
        "span",
        { class: "callout-icon", contenteditable: "false" },
        icon,
      ],
      [
        "div",
        { class: "callout-content" },
        0,
      ],
    ]
  },

  addCommands() {
    return {
      setCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.wrapIn(this.name, attributes)
        },
      toggleCallout:
        (attributes) =>
        ({ commands }) => {
          return commands.toggleWrap(this.name, attributes)
        },
      unsetCallout:
        () =>
        ({ commands }) => {
          return commands.lift(this.name)
        },
    }
  },

  addKeyboardShortcuts() {
    return {
      "Mod-Shift-c": () => this.editor.commands.toggleCallout({ type: "info" }),
    }
  },
})

