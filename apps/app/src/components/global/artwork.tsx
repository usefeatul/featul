import { useId, type SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

export function FilterIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path d="M5 5h14a.75.75 0 0 1 .55 1.26L13.75 12.5V18a.75.75 0 0 1-.41.67l-2 .75a.75.75 0 0 1-1.09-.67V12.5L4.45 6.26A.75.75 0 0 1 5 5Z" />
    </svg>
  );
}

export function LowTractionIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path d="M7.2 4.2A10.8 10.8 0 0 1 12 3c5.5 0 10 4 10 9a8.4 8.4 0 0 1-1.8 5.2l-13-13ZM3.8 7.2A8.3 8.3 0 0 0 2 12c0 1.9.6 3.6 1.7 5.1L2.5 21l4.4-1.1A11 11 0 0 0 12 21c1.8 0 3.4-.4 4.8-1.2l-13-12.6Z" />
      <path d="M2.3 2.3a1 1 0 0 1 1.4 0l18 18a1 1 0 0 1-1.4 1.4l-18-18a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}

export function LogoutIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M4 3h7a1 1 0 0 1 1 1v4H9v8h3v4a1 1 0 0 1-1 1H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Z" />
      <path d="M17.3 7.3a1 1 0 0 1 1.4 0l4 4a1 1 0 0 1 0 1.4l-4 4a1 1 0 0 1-1.4-1.4l2.3-2.3H11v-2h8.6l-2.3-2.3a1 1 0 0 1 0-1.4Z" />
    </svg>
  );
}


export function ShareIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <path d="M11.3 2.7a1 1 0 0 1 1.4 0l3.6 3.6a1 1 0 0 1-.7 1.7H13v6a1 1 0 0 1-2 0V8H8.4a1 1 0 0 1-.7-1.7l3.6-3.6Z" />
      <path d="M4 13a3 3 0 0 1 3-3h2.5v4a2.5 2.5 0 0 0 5 0v-4H17a3 3 0 0 1 3 3v5a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-5Z" />
    </svg>
  );
}

/** Open in a new tab: a filled square with the arrow cut out, matching the filled chart icons. */
export function OpenExternalIcon({ size = 18, ...props }: IconProps) {
  const cut = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <mask id={cut}>
        <rect width="24" height="24" fill="#fff" />
        <path
          d="M9 15l6-6M10 9h5v5"
          fill="none"
          stroke="#000"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </mask>
      <rect x="3" y="3" width="18" height="18" rx="3" mask={`url(#${cut})`} />
    </svg>
  );
}

const BOOK_PATH =
  "M21.5 5.134a1 1 0 0 1 .493 .748l.007 .118v13a1 1 0 0 1 -1.5 .866a8 8 0 0 0 -7.5 -.266v-15.174a10 10 0 0 1 8.5 .708m-10.5 -.707l.001 15.174a8 8 0 0 0 -7.234 .117l-.327 .18l-.103 .044l-.049 .016l-.11 .026l-.061 .01l-.117 .006h-.042l-.11 -.012l-.077 -.014l-.108 -.032l-.126 -.056l-.095 -.056l-.089 -.067l-.06 -.056l-.073 -.082l-.064 -.089l-.022 -.036l-.032 -.06l-.044 -.103l-.016 -.049l-.026 -.11l-.01 -.061l-.004 -.049l-.002 -13.068a1 1 0 0 1 .5 -.866a10 10 0 0 1 8.5 -.707";

/** "No collection": the filled book (the default collection icon) with a slash cut through it. */
export function NoCollectionIcon({ size = 18, ...props }: IconProps) {
  const cut = useId();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden={props["aria-label"] ? undefined : true}
      {...props}
    >
      <mask id={cut}>
        <rect width="24" height="24" fill="#fff" />
        <path d="M3 3l18 18" stroke="#000" strokeWidth="5" strokeLinecap="round" />
      </mask>
      <path d={BOOK_PATH} mask={`url(#${cut})`} />
      <path d="M3 3l18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
