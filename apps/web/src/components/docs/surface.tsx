import type { ComponentType } from "react"
import {
  IconBoltFilled,
  IconBookFilled,
  IconBrandGithubFilled,
  IconKeyboardFilled,
  IconPaletteFilled,
} from "@tabler/icons-react"
import { modalCardShellClass } from "@featul/ui/lib/overlay"
import type { DocsTopicIconKey } from "@/config/docsNav"

/*
 * Docs mirror the public help center (apps/app components/subdomain/help) one to one:
 * these are the same frames it builds from the app's settings cards.
 */

/** Section frame: the create-post dialog's `p-1` shell with the header inside it. */
export const docsSectionClass = `${modalCardShellClass} flex min-w-0 flex-col`

/** Header row inside `docsSectionClass`, aligned like the dialog title. */
export const docsSurfaceHeaderClass =
  "flex flex-wrap items-center justify-between gap-3 px-2.5 py-1.5"

const ICONS: Record<DocsTopicIconKey, ComponentType<{ className?: string; size?: number }>> = {
  book: IconBookFilled,
  bolt: IconBoltFilled,
  palette: IconPaletteFilled,
  keyboard: IconKeyboardFilled,
  github: IconBrandGithubFilled,
}

export function DocsTopicIcon({
  icon,
  className,
}: {
  icon?: DocsTopicIconKey
  className?: string
}) {
  const Icon = ICONS[icon ?? "book"] ?? IconBookFilled
  return <Icon aria-hidden size={18} className={className} />
}
