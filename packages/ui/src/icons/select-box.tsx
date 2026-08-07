import React from "react"

interface SelectBoxIconProps {
  className?: string
  size?: number
}

export const SelectBoxIcon: React.FC<SelectBoxIconProps> = ({
  className = "",
  size = 18,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
    >
      <rect
        x="3.25"
        y="3.25"
        width="11.5"
        height="11.5"
        rx="1.75"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      />
    </svg>
  )
}

export default SelectBoxIcon
