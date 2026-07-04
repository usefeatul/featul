import React from "react"

interface PaymentIconProps {
  className?: string
  size?: number
}

export const PaymentIcon: React.FC<PaymentIconProps> = ({ className = "", size = 18 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
      fill="none"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.25 14.25H3.75C2.64543 14.25 1.75 13.3546 1.75 12.25V7.25H16.25V12.25C16.25 13.3546 15.3546 14.25 14.25 14.25Z"
        fill="currentColor"
        fillOpacity="0.3"
      />
      <path
        d="M1.75 7.25H16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.75 14.25L14.25 14.25C15.3546 14.25 16.25 13.3546 16.25 12.25V5.75C16.25 4.64543 15.3546 3.75 14.25 3.75L3.75 3.75C2.64543 3.75 1.75 4.64543 1.75 5.75L1.75 12.25C1.75 13.3546 2.64543 14.25 3.75 14.25Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.25 11.25H7.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.75 11.25H13.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default PaymentIcon
