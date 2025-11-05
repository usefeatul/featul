import React from 'react'

export function BookmarkIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <title>bookmark</title>
      <g fill="currentColor">
        <path d="m25,1H7c-2.206,0-4,1.794-4,4v26.869l13-8.667,13,8.667V5c0-2.206-1.794-4-4-4Z" strokeWidth="0" />
      </g>
    </svg>
  )
}

export default BookmarkIcon