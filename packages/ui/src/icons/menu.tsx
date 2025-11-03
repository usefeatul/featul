import React from 'react'

export function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 24, height = 24, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      {...rest}
    >
      <title>menu-3</title>
      <g fill="none" stroke="currentColor" strokeLinejoin="miter" strokeLinecap="square">
        <line x1="2" y1="12" x2="22" y2="12" strokeWidth="2" strokeMiterlimit="10"></line>
        <line x1="12" y1="5" x2="22" y2="5" strokeWidth="2" strokeMiterlimit="10"></line>
        <line x1="2" y1="19" x2="12" y2="19" strokeWidth="2" strokeMiterlimit="10"></line>
      </g>
    </svg>
  )
}