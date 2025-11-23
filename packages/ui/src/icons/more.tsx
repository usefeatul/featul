import React from "react";

interface MoreIconProps {
  className?: string;
  size?: number;
}

export const MoreIcon: React.FC<MoreIconProps> = ({ className = "", size = 18 }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      opacity={0.7}
    >
      <title>more</title>
      <g fill="currentColor">
        <circle cx="5" cy="12" r="2" />
        <circle cx="12" cy="12" r="2" />
        <circle cx="19" cy="12" r="2" />
      </g>
    </svg>
  );
};

export default MoreIcon;

