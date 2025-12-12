import React from "react"

export function ChevronDownIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 24, height = 24, ...rest } = props
  return (
    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width={width} height={height} viewBox="0 0 12 12" {...rest}>
      <path d="m6,9.25c-.192,0-.384-.073-.53-.22L1.22,4.78c-.293-.293-.293-.768,0-1.061s.768-.293,1.061,0l3.72,3.72,3.72-3.72c.293-.293.768-.293,1.061,0s.293.768,0,1.061l-4.25,4.25c-.146.146-.338.22-.53.22Z" fill="currentColor"></path>
    </svg>
  )
}

export default ChevronDownIcon
