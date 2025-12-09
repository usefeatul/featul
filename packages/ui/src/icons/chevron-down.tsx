import React from "react"

export function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 24, height = 24, ...rest } = props
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={width} height={height} viewBox="0 0 18 18" {...rest}>
      <polyline points="15.25 6.5 9 12.75 2.75 6.5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}></polyline>
    </svg>
  )
}

export default ChevronDownIcon

