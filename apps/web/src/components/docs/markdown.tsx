import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import { Prose } from "@/components/blog/prose"
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
    <Prose className="prose-h2:font-bold prose-h3:font-bold prose-h2:text-muted-foreground prose-h3:text-muted-foreground prose-pre:m-0 prose-pre:bg-transparent prose-pre:p-0 prose-code:before:content-none prose-code:after:content-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          h2: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugifyHeading(text)
            return (
              <h2 id={id} className="font-bold text-muted-foreground tracking-wide">
                {children}
              </h2>
            )
          },
          h3: ({ children }) => {
            const text = extractTextFromChildren(children)
            const id = slugifyHeading(text)
            return (
              <h3 id={id} className="font-bold text-muted-foreground tracking-wide">
                {children}
              </h3>
            )
          },
          p: ({ children }) => (
            <p className="text-accent tracking-normal">
              {children}
            </p>
          ),
          li: ({ children }) => (
            <li className="text-accent tracking-normal">
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
                className="text-primary"
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer nofollow" : undefined}
              >
                {children}
              </a>
            )
          },
          table: ({ children }) => (
            <OverlayCard className="my-4 h-auto w-full">
              <OverlayCardPanel className="overflow-x-auto p-0">
                <table className="w-full border-collapse text-sm">
                  {children}
                </table>
              </OverlayCardPanel>
            </OverlayCard>
          ),
          thead: ({ children }) => (
            <thead className="bg-primary/20 border-b border-border ">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border last:border-b-0">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-medium text-foreground">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-left text-xs text-accent">
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
