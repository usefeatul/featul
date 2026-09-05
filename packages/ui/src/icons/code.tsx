import React from "react"

interface CodeIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const CodeIcon: React.FC<CodeIconProps> = ({
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
      <title>code</title>
      <rect
        x="1.75"
        y="2.75"
        width="14.5"
        height="12.5"
        rx="2"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <rect
        x="1.75"
        y="2.75"
        width="14.5"
        height="12.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M6.75 6.75L4.25 9l2.5 2.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-right transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-x-0.5"
      />
      <path
        d="M11.25 6.75L13.75 9l-2.5 2.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-left transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:translate-x-0.5"
      />
    </svg>
  )
}

export default CodeIcon
