import React from "react"

interface FeedbackIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const FeedbackIcon: React.FC<FeedbackIconProps> = ({
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
      <title>feedback</title>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <path
          d="M3.75,2.75h10.5c1.105,0,2,.895,2,2v6c0,1.105-.895,2-2,2h-2.833l-2.694,2.48c-.326,.3-.829,.301-1.156,0l-2.694-2.48h-2.833c-1.105,0-2-.895-2-2V4.75c0-1.105,.895-2,2-2Z"
          fill="currentColor"
          fillOpacity="0.3"
        />
        <path
          d="M5.75,6.75h6.5"
          className="origin-left transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-x-90"
        />
        <path
          d="M5.75,9.25h4.25"
          className="origin-left transition-transform duration-300 delay-75 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-x-75"
        />
      </g>
    </svg>
  )
}

export default FeedbackIcon
