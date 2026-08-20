import React from "react";

interface CreditCardIconProps {
  className?: string;
  size?: number;
}

export const CreditCardIcon: React.FC<CreditCardIconProps> = ({
  className = "",
  size = 18,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 18 18"
      className={className}
    >
      <title>credit-card</title>
      <rect
        x="1.75"
        y="2.75"
        width="14.5"
        height="12.5"
        rx="2"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
      />
      <rect
        x="1.75"
        y="2.75"
        width="14.5"
        height="12.5"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M1.75 6.75H16.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M4.25 12.25H8.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
        className="transition-transform duration-200 origin-left group-hover:scale-x-110"
      />
    </svg>
  );
};

export default CreditCardIcon;
