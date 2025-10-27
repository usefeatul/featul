import React from 'react'

export function ArrowIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 18, height = 18, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      {...rest}
    >
      <title>arrow-up-right</title>
      <g
        fill="none"
        stroke="currentColor"
        strokeOpacity={0.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
      >
        <line x1="10" y1="10" x2="16" y2="4" />
        <polyline points="16 11 16 4 9 4" />
      </g>
    </svg>
  )
}