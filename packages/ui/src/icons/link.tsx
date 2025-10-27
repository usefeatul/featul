import React from 'react'

export function LinkIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 18, height = 18, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18 18"
      {...rest}
    >
      <title>pointer</title>
      <g fill="currentColor" opacity={0.4}>
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M2.07949 3.73122C1.70374 2.70213 2.70213 1.70374 3.73122 2.07949L15.1544 6.25356C16.308 6.67566 16.2708 8.31513 15.1057 8.68998L10.2446 10.2455L8.68938 15.1054C8.31557 16.2741 6.67399 16.3072 6.25267 15.1557L2.07949 3.73122Z"
        />
      </g>
    </svg>
  )
}