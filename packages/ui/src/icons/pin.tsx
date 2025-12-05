import React from "react"

export function PinIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 24, height = 24, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      role="img"
      {...rest}
   >
      <title>pin</title>
      <path
        d="M4 20L8.5 15.5L8.30391 15.6961"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="square"
        fill="none"
      />
      <path
        d="M14.3137 21.0048L8.65685 15.3479L3 9.69106L4.2283 8.46276C5.17543 7.51563 6.63567 7.31112 7.80655 7.96161L8.3876 8.28442L15.7279 2.62L21.3848 8.27685L15.7204 15.6172L16.0432 16.1982C16.6936 17.3691 16.4891 18.8293 15.542 19.7765L14.3137 21.0048Z"
        stroke="currentColor"
        strokeWidth={2}
        strokeMiterlimit={10}
        fill="none"
      />
    </svg>
  )
}

export default PinIcon
