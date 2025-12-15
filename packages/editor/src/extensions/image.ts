import Image from "@tiptap/extension-image"

export interface CustomImageOptions {
  HTMLAttributes: Record<string, unknown>
  allowBase64: boolean
}

export const CustomImage = Image.extend<CustomImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: "changelog-image",
      },
      allowBase64: true,
    }
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: null,
        parseHTML: (element) => element.getAttribute("alt"),
        renderHTML: (attributes) => {
          if (!attributes.alt) {
            return {}
          }
          return { alt: attributes.alt }
        },
      },
      title: {
        default: null,
        parseHTML: (element) => element.getAttribute("title"),
        renderHTML: (attributes) => {
          if (!attributes.title) {
            return {}
          }
          return { title: attributes.title }
        },
      },
      width: {
        default: null,
        parseHTML: (element) => element.getAttribute("width"),
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return { width: attributes.width }
        },
      },
      align: {
        default: "center",
        parseHTML: (element) => element.getAttribute("data-align") || "center",
        renderHTML: (attributes) => ({
          "data-align": attributes.align,
        }),
      },
    }
  },

  renderHTML({ HTMLAttributes }) {
    const align = HTMLAttributes["data-align"] || "center"
    const wrapperStyle =
      align === "center"
        ? "text-align: center;"
        : align === "right"
          ? "text-align: right;"
          : "text-align: left;"

    return [
      "figure",
      { style: wrapperStyle, class: "image-wrapper" },
      ["img", HTMLAttributes],
    ]
  },
})

