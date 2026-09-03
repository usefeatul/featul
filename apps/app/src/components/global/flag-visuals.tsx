import type { FC, SVGProps } from "react"
import { LockIcon } from "@featul/ui/icons/lock"
import { PinIcon } from "@featul/ui/icons/pin"
import { StarIcon } from "@featul/ui/icons/star"
import { StarPinIcon } from "@featul/ui/icons/star-pin"
import {
  PinLockIcon,
  StarLockIcon,
  StarPinLockIcon,
} from "@featul/ui/icons/flag-merge"
import type { RequestFlagKey, RequestFlags } from "@/types/request"

export const REQUEST_FLAG_VISUALS = [
  {
    key: "isPinned" as const,
    label: "Pinned",
    Icon: PinIcon,
    iconClass: "text-primary",
    ribbonClass: "bg-primary",
  },
  {
    key: "isFeatured" as const,
    label: "Featured",
    Icon: StarIcon,
    iconClass: "text-amber-500",
    ribbonClass: "bg-amber-500",
  },
  {
    key: "isLocked" as const,
    label: "Locked",
    Icon: LockIcon,
    iconClass: "text-red-500",
    ribbonClass: "bg-red-500",
  },
] as const satisfies ReadonlyArray<{
  key: RequestFlagKey
  label: string
  Icon: FC<SVGProps<SVGSVGElement>>
  iconClass: string
  ribbonClass: string
}>

export type RequestFlagVisual = (typeof REQUEST_FLAG_VISUALS)[number]

export function getActiveRequestFlags(flags: RequestFlags): RequestFlagVisual[] {
  return REQUEST_FLAG_VISUALS.filter((flag) => Boolean(flags[flag.key]))
}

export function getRequestFlagTitle(flags: RequestFlags): string {
  return getActiveRequestFlags(flags)
    .map((flag) => flag.label)
    .join(" · ")
}

/** Solid or split ribbon fill so one, two, or three flags share the same fold. */
export function getFlagRibbonToneClass(flags: RequestFlagVisual[]): string {
  const keys = new Set(flags.map((flag) => flag.key))
  const pin = keys.has("isPinned")
  const featured = keys.has("isFeatured")
  const locked = keys.has("isLocked")

  if (pin && featured && locked) {
    return "bg-linear-to-r from-primary via-amber-500 to-red-500"
  }
  if (pin && featured) return "bg-linear-to-r from-primary to-amber-500"
  if (pin && locked) return "bg-linear-to-r from-primary to-red-500"
  if (featured && locked) return "bg-linear-to-r from-amber-500 to-red-500"
  if (pin) return "bg-primary"
  if (featured) return "bg-amber-500"
  if (locked) return "bg-red-500"
  return "bg-primary"
}

/** One merged glyph for the ribbon: single flags stay simple, pairs reuse the star-pin style. */
export function getFlagRibbonIcon(
  flags: RequestFlagVisual[],
): FC<SVGProps<SVGSVGElement>> {
  const keys = new Set(flags.map((flag) => flag.key))
  const pin = keys.has("isPinned")
  const featured = keys.has("isFeatured")
  const locked = keys.has("isLocked")

  if (pin && featured && locked) return StarPinLockIcon
  if (pin && featured) return StarPinIcon
  if (pin && locked) return PinLockIcon
  if (featured && locked) return StarLockIcon
  if (pin) return PinIcon
  if (featured) return StarIcon
  return LockIcon
}

export function RequestFlagReadout({
  flags,
  className,
}: {
  flags: RequestFlags
  className?: string
}) {
  const active = getActiveRequestFlags(flags)
  if (active.length === 0) return null

  return (
    <span className={className}>
      {active.map((flag) => (
        <span key={flag.key} className="inline-flex items-center gap-1">
          <flag.Icon
            width={12}
            height={12}
            className={`size-3 shrink-0 fill-current ${flag.iconClass}`}
          />
          {flag.label}
        </span>
      ))}
    </span>
  )
}
