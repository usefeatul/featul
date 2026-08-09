import React from "react"

interface EnterKeyIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string
}

export const EnterKeyIcon: React.FC<EnterKeyIconProps> = ({
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
      <path d="M12.5 4.5H5a1.5 1.5 0 0 0-1.5 1.5V8.5" />
      <path d="M5.5 8.5 3 6 5.5 3.5" />
    </svg>
  )
}

export default EnterKeyIcon
