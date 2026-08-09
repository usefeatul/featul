import { cn } from "../../lib/utils"
import { alternativeLogos, type AlternativeLogoSlug } from "./logos-data"

export type AlternativeIconProps = {
  className?: string
  size?: number
}

export type { AlternativeLogoSlug }
export { alternativeLogos }

type AlternativeIconComponentProps = AlternativeIconProps & {
  slug: string
  alt?: string
}

export function AlternativeIcon({
  slug,
  alt,
  className,
  size = 24,
}: AlternativeIconComponentProps) {
  const src = alternativeLogos[slug as AlternativeLogoSlug]

  if (!src) {
    return (
      <span
        aria-hidden
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-md bg-white/25 font-heading text-[0.55em] font-semibold uppercase text-white",
          className,
        )}
        style={{ width: size, height: size }}
      >
        {slug.slice(0, 2)}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? `${slug} logo`}
      width={size}
      height={size}
      className={cn("inline-block shrink-0 rounded-md object-cover", className)}
      loading="eager"
      decoding="async"
    />
  )
}
