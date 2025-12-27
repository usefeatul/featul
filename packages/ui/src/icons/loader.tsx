import React from "react";

interface LoaderIconProps {
  className?: string;
  size?: number;
}

export const LoaderIcon: React.FC<LoaderIconProps> = ({
  className = "",
  size = 24,
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
      <path
        d="M9 1.75V4.25"
        stroke="#1c1f21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14.127 3.873L12.359 5.641"
        opacity="0.88"
        stroke="#1c1f21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M16.25 9H13.75"
        opacity="0.75"
        stroke="#1c1f21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M14.127 14.127L12.359 12.359"
        opacity="0.63"
        stroke="#1c1f21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M9 16.25V13.75"
        opacity="0.5"
        stroke="#1c1f21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M3.87299 14.127L5.64099 12.359"
        opacity="0.38"
        stroke="#1c1f21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M1.75 9H4.25"
        opacity="0.25"
        stroke="#1c1f21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M3.87299 3.873L5.64099 5.641"
        opacity="0.13"
        stroke="#1c1f21"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
};

export default LoaderIcon;
