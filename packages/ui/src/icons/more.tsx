import React from "react";

export function MoreIcon(props: React.SVGProps<SVGSVGElement>) {
  const { width = 18, height = 18, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      <title>more</title>
      <path d="M3 5H15" />
      <path d="M3 9H15" />
      <path d="M3 13H15" />
    </svg>
  );
}

export default MoreIcon;
