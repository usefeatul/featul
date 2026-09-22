import React from "react"

interface EnvelopeIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const EnvelopeIcon: React.FC<EnvelopeIconProps> = ({
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
      <title>envelope</title>
      <rect
        x="1.75"
        y="3.75"
        width="14.5"
        height="10.5"
        rx="2"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <rect
        x="1.75"
        y="3.75"
        width="14.5"
        height="10.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M2.5 5.75L9 10.25l6.5-4.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-top transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:translate-y-0.5"
      />
    </svg>
  )
}

export default EnvelopeIcon
