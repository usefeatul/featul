import React from 'react'

export function LoveIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 20, height = 20, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 32 32"
      {...rest}
    >
      <title>heart</title>
      <g fill="currentColor">
        <path d="m25.54,3.648c-3.362-1.393-7.113-.509-9.54,2.125-2.426-2.634-6.177-3.518-9.539-2.125C2.02,5.485-.151,10.707,1.621,15.288c2.173,5.621,7.678,10.001,9.312,11.209l5.061,3.747,5.072-3.747c1.636-1.208,7.141-5.589,9.313-11.209,1.772-4.581-.399-9.803-4.84-11.64Z" />
      </g>
    </svg>
  )
}

export default LoveIcon