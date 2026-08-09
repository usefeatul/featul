import type { ReactNode } from "react"
import { DocsLayoutShell } from "@/components/docs/layout"

export default function DocsLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <DocsLayoutShell>
      {children}
    </DocsLayoutShell>
  )
}

