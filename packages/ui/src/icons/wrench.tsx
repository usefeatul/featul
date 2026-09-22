import React from "react"

interface WrenchIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const WrenchIcon: React.FC<WrenchIconProps> = ({
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
      <title>wrench</title>
      <path
        d="M13.04 2.86a3.5 3.5 0 0 0-4.72 4.72L3.68 12.22a2.12 2.12 0 1 0 3 3.05l4.64-4.64a3.5 3.5 0 0 0 4.72-4.72l-2.12 2.12-1.77-1.77 2.12-2.12a3.48 3.48 0 0 0-.23-.28Z"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <path
        d="M13.04 2.86a3.5 3.5 0 0 0-4.72 4.72L3.68 12.22a2.12 2.12 0 1 0 3 3.05l4.64-4.64a3.5 3.5 0 0 0 4.72-4.72l-2.12 2.12-1.77-1.77 2.12-2.12a3.48 3.48 0 0 0-.23-.28Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="origin-bottom-left transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:rotate-12"
      />
    </svg>
  )
}

export default WrenchIcon
