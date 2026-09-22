import type { SVGProps } from "react"

type FolderIconProps = SVGProps<SVGSVGElement> & {
  open?: boolean
}

/** Request folder with a shaded navigation pane, matching the workspace icon family. */
export function FolderIcon({ open = false, ...props }: FolderIconProps) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 18 18" fill="none" aria-hidden="true" {...props}>
      <path d="M2.75 3.25h3.5l1.5 1.5h7.5a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1H2.75a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" fill="currentColor" fillOpacity={0.12} />
      <path d="M2.75 3.25h3.5v12h-3.5a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" fill="currentColor" fillOpacity={0.3} />
      <path d="M2.75 3.25h3.5l1.5 1.5h7.5a1 1 0 0 1 1 1v8.5a1 1 0 0 1-1 1H2.75a1 1 0 0 1-1-1v-10a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.25 6.75v8.5" stroke="currentColor" strokeWidth={1.5} />
      <path d={open ? "M12.5 8.25 10.25 10.5l2.25 2.25" : "m10.25 8.25 2.25 2.25-2.25 2.25"} stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
