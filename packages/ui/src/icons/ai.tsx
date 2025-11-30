import React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
  opacity?: number;
};

export function AiIcon({ title = "ai", width = 18, height = 18, opacity = 0.4, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      opacity={0.7}
      viewBox="0 0 18 18"
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      <g fill="currentColor" opacity={opacity}>
        {/* Chip body */}
        <rect x="3" y="4" width="12" height="10" rx="2" ry="2" />
        {/* Pins */}
        <rect x="1" y="6.5" width="2" height="1.5" rx="0.75" />
        <rect x="15" y="6.5" width="2" height="1.5" rx="0.75" />
        <rect x="1" y="10" width="2" height="1.5" rx="0.75" />
        <rect x="15" y="10" width="2" height="1.5" rx="0.75" />
        {/* Neural node and connections */}
        <circle cx="9" cy="9" r="2" />
        <rect x="6.25" y="8.5" width="1.5" height="1" rx="0.5" />
        <rect x="10.25" y="8.5" width="1.5" height="1" rx="0.5" />
        <rect x="8.5" y="6.25" width="1" height="1.5" rx="0.5" />
        <rect x="8.5" y="10.25" width="1" height="1.5" rx="0.5" />
      </g>
    </svg>
  );
}

export default AiIcon;