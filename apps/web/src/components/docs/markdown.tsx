import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card"
import { OverlayChip } from "@featul/ui/components/overlay-chip"
import { GitHubIcon } from "@featul/ui/icons/github"
import { cn } from "@featul/ui/lib/utils"
import { DocsCodeBlock } from "./code-block"
import "./code.css"

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
    <div className="text-base leading-8 text-foreground/80 [&_strong]:font-semibold [&_strong]:text-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h1: () => null,
          h2: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugifyHeading(text)
            return (
              <h2 id={id} className="mb-3 mt-8 scroll-mt-28 text-2xl font-semibold tracking-tight text-foreground first:mt-0">
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugifyHeading(text)
            return (
              <h3 id={id} className="mb-2 mt-8 scroll-mt-28 text-lg font-semibold tracking-tight text-foreground">
                {children}
              </h3>
            )
          },
          p: ({ children }) => (
            <p className="mb-5 text-base leading-8 text-foreground/80">
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="mb-5 list-disc space-y-2 pl-5">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="mb-5 list-decimal space-y-2 pl-5">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-base leading-8 text-foreground/80">
              {children}
            </li>
          ),
          a: ({ href, children }) => {
            const url = typeof href === "string" ? href : ""
            const isExternal = /^https?:\/\//.test(url)
            const isGitHub = url.includes("github.com")
            
            if (isGitHub) {
              return (
                <a
                  href={url}
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-primary px-3 py-1.5 text-sm font-medium text-white! no-underline transition-colors hover:bg-primary/90"
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  <GitHubIcon size={16} className="text-white" />
                  <span className="text-white">{children}</span>
                </a>
              )
            }
            
            return (
              <a
                href={url}
                className="font-medium text-primary underline-offset-4 hover:underline"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer nofollow" : undefined}
              >
                {children}
              </a>
            )
          },
          table: ({ children }) => (
            <div className="my-6 w-full overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead>
              {children}
            </thead>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="py-2 pr-6 text-left text-xs font-medium uppercase tracking-[0.08em] text-foreground/45">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="py-3 pr-6 text-left text-sm text-foreground/70 first:font-medium first:text-foreground">
              {children}
            </td>
          ),
          code: ({ children, className }) => {
            const isInline = !className
            if (isInline) {
              return (
                <OverlayChip
                  className="mx-0.5 align-middle"
                  innerClassName="h-auto min-h-5 px-1.5 font-mono text-[12px] font-medium text-primary"
                >
                  {children}
                </OverlayChip>
              )
            }
            return (
              <code className={cn(className)}>
                {children}
              </code>
            )
          },
          pre: ({ children }) => <DocsCodeBlock>{children}</DocsCodeBlock>,
          blockquote: ({ children }) => (
            <OverlayCard className="my-5 h-auto w-full">
              <OverlayCardPanel className="px-5 py-4 text-sm [&_li]:text-accent [&_ol]:my-3 [&_ol]:space-y-2 [&_p]:my-0 [&_p]:text-accent [&_strong]:text-foreground [&_ul]:my-3 [&_ul]:space-y-2">
                {children}
              </OverlayCardPanel>
            </OverlayCard>
          ),
          img: ({ src, alt }) => {
            const url = typeof src === "string" ? src : ""
            if (!url) return null
            return (
              <OverlayCard className="my-5 h-auto w-full">
                <OverlayCardPanel className="p-0">
                  <img src={url} alt={typeof alt === "string" ? alt : ""} className="block h-auto w-full" />
                </OverlayCardPanel>
              </OverlayCard>
            )
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
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
