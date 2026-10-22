"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

// Same labels as the editor's code block header (packages/editor code-block.ts).
const LANGUAGE_LABELS: Record<string, string> = {
  bash: "Bash",
  css: "CSS",
  html: "HTML",
  javascript: "JavaScript",
  js: "JavaScript",
  json: "JSON",
  jsx: "JSX",
  markdown: "Markdown",
  md: "Markdown",
  python: "Python",
  py: "Python",
  sh: "Shell",
  shell: "Shell",
  sql: "SQL",
  ts: "TypeScript",
  tsx: "TSX",
  typescript: "TypeScript",
  xml: "XML",
  yaml: "YAML",
  yml: "YAML",
}

const COPIED_MS = 1500

export function languageLabel(language: string | undefined) {
  if (!language) return "Code"
  return LANGUAGE_LABELS[language.toLowerCase()] ?? language.charAt(0).toUpperCase() + language.slice(1)
}

/** The help article code frame: editor.css draws the header from `data-language` and styles the copy button. */
export function DocsCodeBlock({ language, children }: { language?: string; children: ReactNode }) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const reset = window.setTimeout(() => setCopied(false), COPIED_MS)
    return () => window.clearTimeout(reset)
  }, [copied])

  function copySnippet() {
    const text = preRef.current?.querySelector("code")?.textContent ?? ""
    if (!text) return
    navigator.clipboard
      ?.writeText(text)
      .then(() => setCopied(true))
      .catch(() => {})
  }

  return (
    <pre ref={preRef} data-language={languageLabel(language)}>
      <button
        type="button"
        className="featul-code-copy"
        aria-label={copied ? "Copied" : "Copy code"}
        title="Copy"
        data-copied={copied ? "true" : undefined}
        onClick={copySnippet}
      />
      {children}
    </pre>
  )
}
