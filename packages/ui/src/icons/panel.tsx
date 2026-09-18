import type { SVGProps } from "react"

export function PanelIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <g strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
        <rect x={1.75} y={2.75} width={14.5} height={12.5} rx={2} fill="currentColor" fillOpacity={0.3} stroke="currentColor" />
        <path d="M11.75 2.75V15.25M5.75 6.75L8 9L5.75 11.25" stroke="currentColor" />
      </g>
    </svg>
  )
}
