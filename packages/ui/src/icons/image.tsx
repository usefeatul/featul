import React from "react"

interface ImageIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const ImageIcon: React.FC<ImageIconProps> = ({
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
      <title>image</title>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <rect x="2.75" y="2.75" width="12.5" height="12.5" rx="2" ry="2" fill="currentColor" fillOpacity="0.3" />
        <circle
          cx="6.25"
          cy="7.25"
          r="1.25"
          fill="currentColor"
          fillOpacity="0.3"
          className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-y-px group-hover:translate-x-px"
        />
        <path
          d="M15.25,10.75l-3.5-3.5c-.552-.552-1.448-.552-2,0l-6,6"
          className="origin-bottom-left transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-95"
        />
      </g>
    </svg>
  )
}

export default ImageIcon
