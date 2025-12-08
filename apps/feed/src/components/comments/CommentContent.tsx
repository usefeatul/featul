import React from "react"
import ContentImage from "@/components/global/ContentImage"
import { CommentData } from "../../types/comment"

interface CommentContentProps {
  content: string
  metadata?: CommentData["metadata"]
}

export default function CommentContent({ content, metadata }: CommentContentProps) {
  const renderText = () => {
    const text = content || ""
    const mentions = (metadata?.mentions || [])
      .map((m) => (m || "").toLowerCase())
      .sort((a, b) => b.length - a.length)

    if (!text || mentions.length === 0) return text

    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(`@(${mentions.map(esc).join("|")})\\b`, "gi")
    const parts: React.ReactNode[] = []
    let lastIndex = 0
    let m: RegExpExecArray | null

    while ((m = pattern.exec(text))) {
      if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index))
      const matched = m[0]
      parts.push(
        <span key={`m-${m.index}`} className="text-primary font-medium">
          {matched}
        </span>
      )
      lastIndex = m.index + matched.length
    }
    if (lastIndex < text.length) parts.push(text.slice(lastIndex))
    return parts
  }

  return (
    <>
      {content && (
        <div className="text-[15px] text-foreground/90 whitespace-pre-wrap break-words leading-7 font-normal">
          {renderText()}
        </div>
      )}
      {/* Display images from metadata */}
      {metadata?.attachments && metadata.attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {metadata.attachments
            .filter((att) => att.type.startsWith("image/"))
            .map((att, idx) => (
              <ContentImage
                key={idx}
                url={att.url}
                alt={att.name}
                className="max-w-[120px] max-h-20"
              />
            ))}
        </div>
      )}
    </>
  )
}
