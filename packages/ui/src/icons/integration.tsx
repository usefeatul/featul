import React from "react"

interface IntegrationIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const IntegrationIcon: React.FC<IntegrationIconProps> = ({
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
      <title>integration</title>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <rect
          x="2.25"
          y="2.25"
          width="7.5"
          height="7.5"
          rx="1.5"
          fill="currentColor"
          fillOpacity="0.3"
          className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-x-px group-hover:-translate-y-px"
        />
        <rect
          x="8.25"
          y="8.25"
          width="7.5"
          height="7.5"
          rx="1.5"
          className="origin-center transition-transform duration-300 delay-75 ease-[cubic-bezier(.2,.0,0,1)] group-hover:translate-x-px group-hover:translate-y-px"
        />
      </g>
    </svg>
  )
}

export default IntegrationIcon
