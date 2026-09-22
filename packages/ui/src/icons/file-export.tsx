import React from "react"

interface FileExportIconProps {
  className?: string
  size?: number
  opacity?: number
}

export const FileExportIcon: React.FC<FileExportIconProps> = ({
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
      <title>file-export</title>
      <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" stroke="currentColor">
        <path
          d="M5.25,15.25h-1.5c-1.105,0-2-.895-2-2V4.75c0-1.105,.895-2,2-2h5.586c.265,0,.52,.105,.707,.293l3.414,3.414c.188,.188,.293,.442,.293,.707v2.086"
          fill="currentColor"
          fillOpacity="0.3"
        />
        <path
          d="M7.25,2.75v3c0,1.105,.895,2,2,2h3"
          className="origin-top-left transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-90"
        />
        <polyline
          points="10.5 13.25 12.75 11 15 13.25"
          className="origin-center transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:-translate-y-0.5"
        />
        <line
          x1="12.75"
          y1="11"
          x2="12.75"
          y2="16.25"
          className="origin-bottom transition-transform duration-300 ease-[cubic-bezier(.2,.0,0,1)] group-hover:scale-y-90"
        />
      </g>
    </svg>
  )
}

export default FileExportIcon
