import React from "react"

export function LockIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 24, height = 24, ...rest } = props

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={width}
      height={height}
      viewBox="0 0 12 12"
      {...rest}
    >
      <path
        d="m8.25 6c-.414 0-.75-.336-.75-.75v-2.25c0-.827-.673-1.5-1.5-1.5s-1.5.673-1.5 1.5v2.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-2.25c0-1.654 1.346-3 3-3s3 1.346 3 3v2.25c0 .414-.336.75-.75.75Z"
        fill="currentColor"
        strokeWidth="0"
      />
      <path
        d="M9.25 4.5H2.75C1.509 4.5.5 5.509.5 6.75v3C.5 10.991 1.509 12 2.75 12h6.5c1.241 0 2.25-1.009 2.25-2.25v-3c0-1.241-1.009-2.25-2.25-2.25Zm-2.5 4.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-1c0-.414.336-.75.75-.75s.75.336.75.75v1Z"
        fill="currentColor"
        strokeWidth="0"
      />
    </svg>
  )
}

export default LockIcon
