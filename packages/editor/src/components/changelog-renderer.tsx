"use client"

import * as React from "react"
import { useMemo } from "react"
import type { JSONContent } from "@tiptap/react"
import { cn } from "../lib/utils"

export interface ChangelogRendererProps {
  content: JSONContent
  className?: string
}

type CalloutType = "info" | "warning" | "success" | "error"

const calloutIcons: Record<CalloutType, string> = {
  info: "ℹ️",
  warning: "⚠️",
  success: "✅",
  error: "❌",
}

function renderMark(
  text: string,
  marks?: Array<{ type: string; attrs?: Record<string, unknown> }>
): React.ReactNode {
  if (!marks || marks.length === 0) {
    return text
  }

  return marks.reduce<React.ReactNode>((acc, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong>{acc}</strong>
      case "italic":
        return <em>{acc}</em>
      case "underline":
        return <u>{acc}</u>
      case "strike":
        return <s>{acc}</s>
      case "code":
        return <code>{acc}</code>
      case "link":
        return (
          <a
            href={mark.attrs?.href as string}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            {acc}
          </a>
        )
      default:
        return acc
    }
  }, text)
}

function renderContent(content?: JSONContent[]): React.ReactNode {
  if (!content) return null

  return content.map((node, index) => {
    if (node.type === "text") {
      return (
        <React.Fragment key={index}>
          {renderMark(node.text || "", node.marks)}
        </React.Fragment>
      )
    }

    return <RenderNode key={index} node={node} />
  })
}

function RenderNode({ node }: { node: JSONContent }): React.ReactNode {
  switch (node.type) {
    case "doc":
      return <>{renderContent(node.content)}</>

    case "paragraph":
      return <p>{renderContent(node.content)}</p>

    case "heading": {
      const level = node.attrs?.level || 1
      const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
      return <Tag>{renderContent(node.content)}</Tag>
    }

    case "bulletList":
      return <ul>{renderContent(node.content)}</ul>

    case "orderedList":
      return <ol>{renderContent(node.content)}</ol>

    case "listItem":
      return <li>{renderContent(node.content)}</li>

    case "taskList":
      return (
        <ul className="list-none pl-0 space-y-1">
          {renderContent(node.content)}
        </ul>
      )

    case "taskItem": {
      const checked = node.attrs?.checked || false
      return (
        <li className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={checked}
            readOnly
            className="mt-1 h-4 w-4 rounded border-border"
          />
          <div className="flex-1">{renderContent(node.content)}</div>
        </li>
      )
    }

    case "blockquote":
      return (
        <blockquote className="border-l-4 border-primary/50 pl-4 italic">
          {renderContent(node.content)}
        </blockquote>
      )

    case "codeBlock": {
      const language = node.attrs?.language || ""
      return (
        <pre className="rounded-lg bg-[#1e1e2e] p-4 overflow-x-auto">
          <code className="text-[#cdd6f4] text-sm" data-language={language}>
            {node.content?.map((n) => n.text).join("") || ""}
          </code>
        </pre>
      )
    }

    case "horizontalRule":
      return <hr className="my-8 border-border" />

    case "image": {
      const { src, alt, title, width } = node.attrs || {}
      return (
        <figure className="my-6 text-center">
          <img
            src={src as string}
            alt={(alt as string) || ""}
            title={(title as string) || undefined}
            width={width as number | undefined}
            className="rounded-lg inline-block max-w-full"
          />
          {title && (
            <figcaption className="mt-2 text-sm text-muted-foreground">
              {title as string}
            </figcaption>
          )}
        </figure>
      )
    }

    case "callout": {
      const type = (node.attrs?.type as CalloutType) || "info"
      const icon = calloutIcons[type] || calloutIcons.info
      return (
        <div className={cn("callout flex gap-3 rounded-lg border p-4 my-4", type)}>
          <span className="callout-icon flex-shrink-0 text-lg">{icon}</span>
          <div className="callout-content flex-1 min-w-0">
            {renderContent(node.content)}
          </div>
        </div>
      )
    }

    case "hardBreak":
      return <br />

    default:
      // For unknown node types, try to render content if available
      if (node.content) {
        return <>{renderContent(node.content)}</>
      }
      return null
  }
}

export function ChangelogRenderer({ content, className }: ChangelogRendererProps) {
  const rendered = useMemo(() => {
    if (!content) return null
    return <RenderNode node={content} />
  }, [content])

  return (
    <div className={cn("changelog-renderer", className)}>
      {rendered}
    </div>
  )
}

