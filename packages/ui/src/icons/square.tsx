import React from 'react'

export function SquareIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 32, height = 32, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 32 32"
      role="img"
      {...rest}
   >
      <title>square-layout-grid</title>
      <g fill="currentColor">
        <path d="m17,17v13h9c2.206,0,4-1.794,4-4v-9h-13Z" strokeWidth="0"></path>
        <path d="m17,15h13V6c0-2.206-1.794-4-4-4h-9v13Z" strokeWidth="0"></path>
        <path d="m15,15V2H6c-2.206,0-4,1.794-4,4v9h13Z" strokeWidth="0"></path>
        <path d="m15,17H2v9c0,2.206,1.794,4,4,4h9v-13Z" strokeWidth="0"></path>
      </g>
    </svg>
  )
}

export default SquareIcon