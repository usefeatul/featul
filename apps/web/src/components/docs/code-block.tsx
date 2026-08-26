"use client"

import { useRef, useState, type ReactNode } from "react"
import { Copy } from "lucide-react"
import { Button } from "@featul/ui/components/button"
import { TickIcon } from "@featul/ui/icons/tick"
import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card"

function getLanguage(children: ReactNode): string | undefined {
  const child = Array.isArray(children) ? children[0] : children
  if (!child || typeof child !== "object" || !("props" in child)) return undefined

  const className = (child.props as { className?: string }).className ?? ""
  const match = className.match(/language-([\w+-]+)/)
  return match?.[1]
}

function copyWithFallback(text: string) {
  const textarea = document.createElement("textarea")
  textarea.value = text
  textarea.setAttribute("readonly", "")
  textarea.style.position = "fixed"
  textarea.style.left = "-9999px"
  document.body.appendChild(textarea)
  textarea.select()
  const ok = document.execCommand("copy")
  document.body.removeChild(textarea)
  if (!ok) throw new Error("Copy failed")
}

export function DocsCodeBlock({ children }: { children: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)
  const language = getLanguage(children)

  async function copySnippet() {
    const text = preRef.current?.textContent?.trim() ?? ""
    if (!text) return

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        copyWithFallback(text)
      }
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      try {
        copyWithFallback(text)
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      } catch {
        setCopied(false)
      }
    }
  }

  return (
    <OverlayCard className="not-prose my-4 h-auto w-full">
      <OverlayCardPanel className="relative bg-background px-4 py-3.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {language || "code"}
          </span>
          <Button
            type="button"
            variant="card"
            size="icon-sm"
            className="size-7 text-muted-foreground hover:text-foreground"
            onClick={copySnippet}
            aria-label={copied ? "Copied" : "Copy code"}
            title={copied ? "Copied" : "Copy code"}
          >
            {copied ? (
              <TickIcon width={14} height={14} />
            ) : (
              <Copy className="size-3.5" />
            )}
          </Button>
        </div>
        <pre ref={preRef} className="docs-code overflow-x-auto">
          {children}
        </pre>
      </OverlayCardPanel>
    </OverlayCard>
  )
}
