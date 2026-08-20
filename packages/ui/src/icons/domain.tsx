import React from "react"

interface DomainIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const DomainIcon: React.FC<DomainIconProps> = ({
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
      <title>globe</title>
      <circle
        cx="9"
        cy="9"
        r="7.25"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <circle
        cx="9"
        cy="9"
        r="7.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <ellipse
        cx="9"
        cy="9"
        rx="3"
        ry="7.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-center transition-transform duration-500 ease-[cubic-bezier(.2,.0,0,1)] group-hover:rotate-12"
      />
      <path
        d="M1.75 9H16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-x-90"
      />
    </svg>
  )
}

export default DomainIcon
