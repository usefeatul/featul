import React from "react";

interface MoveHorizontalIconProps {
  className?: string;
  size?: number;
}

export const MoveHorizontalIcon: React.FC<MoveHorizontalIconProps> = ({
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
      <path d="M2.5 9L7.2 4.3V13.7L2.5 9Z" fill="currentColor" />
      <rect
        x="6.2"
        y="7.2"
        width="5.6"
        height="3.6"
        rx="1.8"
        fill="currentColor"
      />
      <path d="M15.5 9L10.8 13.7V4.3L15.5 9Z" fill="currentColor" />
    </svg>
  );
};

export default MoveHorizontalIcon;
