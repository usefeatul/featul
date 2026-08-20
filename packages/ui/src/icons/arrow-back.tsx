import React from "react";

interface ArrowBackIconProps {
  className?: string;
  size?: number;
}

export const ArrowBackIcon: React.FC<ArrowBackIconProps> = ({
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
      <title>arrow-left</title>
      <path
        d="M7 5.25L3.25 9L7 12.75V5.25Z"
        fill="currentColor"
        fillOpacity="0.3"
        data-color="color-2"
        className="transition-transform duration-200 origin-right group-hover:-translate-x-0.5"
      />
      <path
        d="M13.25 9H3.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="transition-transform duration-200 group-hover:-translate-x-0.5"
      />
      <path
        d="M7 5.25L3.25 9L7 12.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        className="transition-transform duration-200 origin-right group-hover:-translate-x-0.5"
      />
    </svg>
  );
};

export default ArrowBackIcon;
