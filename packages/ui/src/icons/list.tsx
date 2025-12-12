import React from "react"

export function ListIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 24, height = 24, ...rest } = props
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={width} height={height} viewBox="0 0 18 18" {...rest}>
      <rect x="2" y="2" width="6" height="14" rx="2.25" ry="2.25" fill="currentColor"></rect>
      <rect x="10" y="2" width="6" height="8" rx="2.25" ry="2.25" fill="currentColor" data-color="color-2"></rect>
    </svg>
  )
}

export default ListIcon

