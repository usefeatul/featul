import React from "react"

interface LinkStrokeIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const LinkStrokeIcon: React.FC<LinkStrokeIconProps> = ({
  className = "",
  size = 18,
  opacity = 1,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      opacity={opacity}
      className={className}
    >
      <title>link</title>
      <rect
        x="2.75"
        y="2.75"
        width="12.5"
        height="12.5"
        rx="3.5"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
        className="origin-center transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-100"
      />
      <rect
        x="2.75"
        y="2.75"
        width="12.5"
        height="12.5"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-center transition-transform duration-150 ease-out group-hover:scale-105 group-active:scale-100"
      />
      <g className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
        <path
          d="M7.5 10.5 11.25 6.75"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M9.25 6.75h2v2"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </g>
    </svg>
  )
}

export default LinkStrokeIcon
