import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function RoadmapIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M8 3 2.7 5.1A1.1 1.1 0 0 0 2 6.12V20a1 1 0 0 0 1.37.93L8 19.08V3Zm1.5.08v16l5 1.84v-16l-5-1.84ZM21 3.07l-5 2v16l5.3-2.12a1.1 1.1 0 0 0 .7-1.02V4a1 1 0 0 0-1-1Z" />
    </svg>
  );
}

export function ChangelogIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.45 2.18a1 1 0 0 0-1.02.06L10 7.2v9.6l7.43 4.96A1 1 0 0 0 19 20.93V3.07a1 1 0 0 0-.55-.89ZM8.5 8H5a3 3 0 0 0-3 3v2a3 3 0 0 0 3 3h3.5V8ZM5 17.5V21a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3.5H5ZM20.5 8.18v7.64a4 4 0 0 0 0-7.64Z" />
    </svg>
  );
}
