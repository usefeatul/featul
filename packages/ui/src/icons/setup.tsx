import React from 'react'

export function SetupIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 18, height = 18, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 12 12"
      {...rest}
    >
      <title>sliders</title>
      <g fill="currentColor">
        <path d="m11.25,9.5H.75c-.414,0-.75-.336-.75-.75s.336-.75.75-.75h10.5c.414,0,.75.336.75.75s-.336.75-.75.75Z" />
        <path d="m11.25,4H.75c-.414,0-.75-.336-.75-.75s.336-.75.75-.75h10.5c.414,0,.75.336.75.75s-.336.75-.75.75Z" />
        <circle cx="4.5" cy="8.75" r="2.5" />
        <circle cx="7.5" cy="3.25" r="2.5" />
      </g>
    </svg>
  )
}