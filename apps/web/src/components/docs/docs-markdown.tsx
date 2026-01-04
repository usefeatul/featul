import React from "react"
import ReactMarkdown from "react-markdown"
import { Prose } from "@/components/blog/prose"

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

export function DocsMarkdown({ markdown }: { markdown: string }) {
  return (
    <Prose>
      <ReactMarkdown
        components={{
          h2: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugifyHeading(text)
            return (
              <h2 id={id}>
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugifyHeading(text)
            return (
              <h3 id={id}>
                {children}
              </h3>
            )
          },
          a: ({ href, children }) => {
            const url = typeof href === "string" ? href : ""
            const isExternal = /^https?:\/\//.test(url)
            return (
              <a
                href={url}
                className="text-primary"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer nofollow" : undefined}
              >
                {children}
              </a>
            )
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </Prose>
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
