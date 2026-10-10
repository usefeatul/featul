import React from "react";

interface ClockIconProps {
  className?: string;
  size?: number;
  opacity?: number;
}

export const ClockIcon: React.FC<ClockIconProps> = ({
  className = "",
  size = 18,
  opacity = 1,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      opacity={opacity}
      className={className}
      aria-hidden="true"
    >
      <g
        transform="translate(0.75 0.75) scale(0.9375)"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 6V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" />
      </g>
    </svg>
  );
};

export default ClockIcon;
