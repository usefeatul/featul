import type { SVGProps } from "react"
import { cn } from "../lib/utils"

export function PanelIcon({ side = "left", className, ...props }: SVGProps<SVGSVGElement> & { side?: "left" | "right" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" className={cn("text-neutral-400 dark:text-neutral-300", className)} {...props}>
      <g transform={side === "right" ? "translate(18 0) scale(-1 1)" : undefined} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <path d="M3.75 2.75H6V15.25H3.75A2 2 0 0 1 1.75 13.25V4.75A2 2 0 0 1 3.75 2.75Z" fill="currentColor" fillOpacity={0.3} />
        <rect x={1.75} y={2.75} width={14.5} height={12.5} rx={2} stroke="currentColor" />
        <path d="M6 2.75V15.25" stroke="currentColor" />
      </g>
    </svg>
  )
}
