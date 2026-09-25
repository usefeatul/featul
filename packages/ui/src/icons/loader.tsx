import React from "react";

interface LoaderIconProps {
  className?: string;
  size?: number;
  "aria-label"?: string;
}

const dots = [
  [8, 1.5],
  [12.5962, 3.4038],
  [14.5, 8],
  [12.5962, 12.5962],
  [8, 14.5],
  [3.4038, 12.5962],
  [1.5, 8],
  [3.4038, 3.4038],
];

/** Eight fading dots in a ring, based on loading.dev's Circular dots spinner. */
export const LoaderIcon: React.FC<LoaderIconProps> = ({
  className = "",
  size,
  "aria-label": label,
}) => {
  return (
    <svg
      className={`featul-circular-dots ${className}`}
      style={size ? { width: size, height: size } : undefined}
      role={label ? "status" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      viewBox="0 0 16 16"
      fill="currentColor"
    >
      {dots.map(([cx, cy], index) => (
        <circle
          key={index}
          className="featul-circular-dots__dot"
          cx={cx}
          cy={cy}
          r="1.5"
          style={{ "--dots-step": index } as React.CSSProperties}
        />
      ))}
    </svg>
  );
};

export default LoaderIcon;
