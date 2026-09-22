import React from "react"

const STAR_PATH =
  "M9,13.964c0-.863,.55-1.625,1.369-1.897l.55-.184,.184-.551c.267-.798,1.029-1.332,1.897-1.332,.359,0,.689,.11,.984,.273l2.789-2.718c.205-.199,.278-.498,.19-.769-.088-.271-.323-.469-.605-.51l-4.62-.671L9.672,1.418c-.252-.512-1.093-.512-1.345,0l-2.066,4.186-4.62,.671c-.282,.041-.517,.239-.605,.51-.088,.271-.015,.57,.19,.769l3.343,3.258-.79,4.601c-.048,.282.067,.566,.298,.734.232,.167.537,.19,.79,.057l4.132-2.173,.012,.006c0-.025-.012-.048-.012-.073Z"

const PIN_HEAD =
  "M13.929,8.997c-.266-.456-.578-.888-.929-1.288V3.75c0-1.517-1.233-2.75-2.75-2.75h-2.5c-1.517,0-2.75,1.233-2.75,2.75v3.959c-.352,.4-.663,.832-.929,1.288-.563,.965-.921,2.027-1.065,3.158-.027,.214,.039,.429,.181,.59,.143,.162,.348,.254,.563,.254H14.25c.215,0,.42-.093,.563-.254,.142-.162,.208-.376,.181-.59-.144-1.131-.502-2.193-1.065-3.158Z"

const PIN_NEEDLE =
  "M9,17c-.414,0-.75-.336-.75-.75v-4c0-.414,.336-.75,.75-.75s.75,.336,.75,.75v4c0-.414-.336,.75-.75,.75Z"

const LOCK_SHACKLE =
  "m8.25 6c-.414 0-.75-.336-.75-.75v-2.25c0-.827-.673-1.5-1.5-1.5s-1.5.673-1.5 1.5v2.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-2.25c0-1.654 1.346-3 3-3s3 1.346 3 3v2.25c0 .414-.336.75-.75.75Z"

const LOCK_BODY =
  "M9.25 4.5H2.75C1.509 4.5.5 5.509.5 6.75v3C.5 10.991 1.509 12 2.75 12h6.5c1.241 0 2.25-1.009 2.25-2.25v-3c0-1.241-1.009-2.25-2.25-2.25Zm-2.5 4.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-1c0-.414.336-.75.75-.75s.75.336.75.75v1Z"

function MiniPin({ transform }: { transform: string }) {
  return (
    <g transform={transform} fill="currentColor" opacity="0.9">
      <path d={PIN_NEEDLE} />
      <path d={PIN_HEAD} />
    </g>
  )
}

function MiniLock({ transform }: { transform: string }) {
  return (
    <g transform={transform} fill="currentColor" opacity="0.9">
      <path d={LOCK_SHACKLE} />
      <path d={LOCK_BODY} />
    </g>
  )
}

type IconProps = React.SVGProps<SVGSVGElement>

function FlagMergeSvg({
  title,
  children,
  ...props
}: IconProps & { title: string; children: React.ReactNode }) {
  const { width = 18, height = 18, ...rest } = props
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 18 18"
      fill="currentColor"
      role="img"
      {...rest}
    >
      <title>{title}</title>
      {children}
    </svg>
  )
}

/** Featured + locked: star with lock accents. */
export function StarLockIcon(props: IconProps) {
  return (
    <FlagMergeSvg title="featured and locked" {...props}>
      <MiniLock transform="translate(1.1, 1.2) scale(0.32)" />
      <path d={STAR_PATH} />
      <MiniLock transform="translate(12.4, 10.6) scale(0.32)" />
      <circle cx="14.25" cy="3.25" r=".75" opacity="0.8" />
    </FlagMergeSvg>
  )
}

/** Pinned + locked: pin with lock accents. */
export function PinLockIcon(props: IconProps) {
  return (
    <FlagMergeSvg title="pinned and locked" {...props}>
      <path d={PIN_NEEDLE} />
      <path d={PIN_HEAD} />
      <MiniLock transform="translate(11.8, 10.2) scale(0.34)" />
      <circle cx="14.25" cy="3.25" r=".75" opacity="0.8" />
    </FlagMergeSvg>
  )
}

/** Pinned + featured + locked: star with pin and lock accents. */
export function StarPinLockIcon(props: IconProps) {
  return (
    <FlagMergeSvg title="pinned, featured, and locked" {...props}>
      <MiniPin transform="translate(0.8, 0.9) scale(0.25)" />
      <path d={STAR_PATH} />
      <MiniLock transform="translate(12.4, 10.6) scale(0.32)" />
      <circle cx="14.25" cy="3.25" r=".75" opacity="0.8" />
    </FlagMergeSvg>
  )
}
