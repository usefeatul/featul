import React from "react"

interface EscapeKeyIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export const EscapeKeyIcon: React.FC<EscapeKeyIconProps> = ({
  size = 14,
  className,
  ...props
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
      {...props}
    >
      <path d="M10.5 3.5H5.5A1.5 1.5 0 0 0 4 5v6a1.5 1.5 0 0 0 1.5 1.5H10" />
      <path d="M7 8 4.5 5.5 7 3" />
    </svg>
  )
}

export default EscapeKeyIcon
