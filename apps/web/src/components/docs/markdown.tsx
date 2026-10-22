import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { DocsCodeBlock } from "./code-block"
import "@featul/editor/styles/editor.css"
import "@featul/editor/styles/table.css"

function slugifyHeading(input: string) {
  return input
    .toLowerCase()
    .replace(/&amp;|&/g, " and ")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function extractTextFromChildren(children: React.ReactNode): string {
  if (typeof children === "string" || typeof children === "number") {
    return String(children)
  }

  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join("")
  }

  if (React.isValidElement(children)) {
    const element = children as React.ReactElement
    return extractTextFromChildren((element.props as { children?: React.ReactNode }).children)
  }

  return ""
}

// Element styling (headings, callouts, code, tables...) is the shared content design in
// @featul/editor's editor.css, the same one help articles render with; this only sets the
// reading container.
const proseClass = "ProseMirror prose dark:prose-invert max-w-none focus:outline-none"

// Code blocks use the docs' JetBrains Mono (loaded in the docs layout).
const contentStyle = {
  "--content-mono": "var(--font-docs-code), ui-monospace, SFMono-Regular, Menlo, monospace",
} as React.CSSProperties

export function DocsMarkdown({ markdown }: { markdown: string }) {
  return (
    <div className="min-w-0 max-w-full">
      <div className={proseClass} contentEditable={false} style={contentStyle}>
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            h1: () => null,
            h2: ({ children }) => (
              // Anchor jumps land below the fixed marketing navbar.
              <h2 id={slugifyHeading(extractTextFromChildren(children))} className="scroll-mt-28">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 id={slugifyHeading(extractTextFromChildren(children))} className="scroll-mt-28">
                {children}
              </h3>
            ),
            a: ({ href, children }) => {
              const url = typeof href === "string" ? href : ""
              const isExternal = /^https?:\/\//.test(url)
              return (
                <a
                  href={url}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer nofollow" : undefined}
                >
                  {children}
                </a>
              )
            },
            table: ({ children }) => (
              <div className="tableWrapper overflow-x-auto">
                <table>{children}</table>
              </div>
            ),
            // Read the fence language here on the server so the header label hydrates as rendered.
            pre: ({ node, children }) => {
              const code = node?.children[0]
              const classes = code && "properties" in code ? code.properties.className : undefined
              const language = Array.isArray(classes)
                ? classes.map(String).find((c) => c.startsWith("language-"))?.slice("language-".length)
                : undefined
              return <DocsCodeBlock language={language}>{children}</DocsCodeBlock>
            },
          }}
        >
          {markdown}
        </ReactMarkdown>
      </div>
    </div>
  )
}

export type TocItem = {
  id: string
  text: string
  level: 2 | 3
}

export function extractDocsToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n")
  const items: TocItem[] = []

  for (const line of lines) {
    if (line.startsWith("## ")) {
      const text = line.replace(/^##\s+/, "").trim()
      const id = slugifyHeading(text)
      items.push({ id, text, level: 2 })
    } else if (line.startsWith("### ")) {
      const text = line.replace(/^###\s+/, "").trim()
      const id = slugifyHeading(text)
      items.push({ id, text, level: 3 })
    }
  }

  return items
}
