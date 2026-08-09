import type { ReactNode } from "react"
import { SkyPageShell } from "@/components/layout/shell"

type ToolsPageShellProps = {
  children: ReactNode
  dataComponent?: string
  eyebrow?: ReactNode
  title?: ReactNode
  description?: ReactNode
  meta?: ReactNode
  /** @deprecated Kept for call-site compatibility; ignored in favor of the shared sky shell. */
  mainClassName?: string
  /** @deprecated Kept for call-site compatibility; ignored in favor of the shared sky shell. */
  sectionClassName?: string
}

export default function ToolsPageShell({
  children,
  dataComponent,
  eyebrow,
  title,
  description,
  meta,
}: ToolsPageShellProps) {
  return (
    <SkyPageShell
      dataComponent={dataComponent}
      eyebrow={eyebrow}
      title={title}
      description={description}
      meta={meta}
    >
      {children}
    </SkyPageShell>
  )
}
