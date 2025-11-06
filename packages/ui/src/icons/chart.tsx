import * as React from "react";

export type IconProps = React.SVGProps<SVGSVGElement> & {
  title?: string;
};

export function ChartIcon({ title = "chart-bar-trend-up", ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={props.width ?? 18}
      height={props.height ?? 18}
      viewBox="0 0 18 18"
      aria-hidden={title ? undefined : true}
      role={title ? "img" : "presentation"}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}>
        <rect x={13.25} y={2.75} width={2.5} height={12.5} rx={1} ry={1} />
        <rect x={7.75} y={7.75} width={2.5} height={7.5} rx={1} ry={1} />
        <rect x={2.25} y={11.75} width={2.5} height={3.5} rx={1} ry={1} />
        <polyline points="6.25 2.75 8.75 2.75 8.75 5.25" />
        <line x1={8.5} y1={3} x2={2.75} y2={8.75} />
      </g>
    </svg>
  );
}

export default ChartIcon;