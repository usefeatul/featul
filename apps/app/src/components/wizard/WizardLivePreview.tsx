"use client"

import React from "react"
import { DitherGradient } from "@featul/ui/components/gradient"
import { LockIcon } from "@/components/global/icons"
import { hostFromDomain } from "@/utils/domain"
import type { WizardStepId } from "./steps"
import {
  DesktopViewport,
  FeedbackHomePreview,
  HelpHomePreview,
  PortalHeaderPreview,
  PREVIEW_BRAND_PRIMARY,
  PREVIEW_CARD_WIDTH,
} from "./WizardPortalPreview"
import { workspaceHost } from "@/config/domain";

/** How much of the panel the preview fills, across and down. */
const FILL_WIDTH = 0.94
const FILL_HEIGHT = 0.9

/**
 * Scale that fits `card` inside `frame`. The card is laid out at its natural size and scaled
 * as a whole, so its type and spacing stay in proportion at any panel size.
 */
function useFitScale(
  frame: React.RefObject<HTMLDivElement | null>,
  card: React.RefObject<HTMLDivElement | null>,
) {
  const [scale, setScale] = React.useState<number | null>(null)
  React.useLayoutEffect(() => {
    const frameEl = frame.current
    const cardEl = card.current
    if (!frameEl || !cardEl) return
    const fit = () => {
      if (!frameEl.clientWidth || !cardEl.offsetWidth) return
      setScale(
        Math.min(
          (frameEl.clientWidth * FILL_WIDTH) / cardEl.offsetWidth,
          (frameEl.clientHeight * FILL_HEIGHT) / cardEl.offsetHeight,
        ),
      )
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(frameEl)
    observer.observe(cardEl)
    return () => observer.disconnect()
  }, [frame, card])
  return scale
}

/**
 * Right-hand preview for workspace setup: a copy of the public portal, scaled up to fill the panel
 * (the same header, board list and sidebar as `{slug}.featul.com`), filled in as the user types.
 * The last step shows the help center home instead.
 */
export default function WizardLivePreview({
  step,
  domain,
  name,
  slug,
  draftHelp,
}: {
  step: WizardStepId
  domain: string
  name: string
  slug: string
  timezone?: string
  now?: Date
  draftHelp: boolean
}) {
  const host = hostFromDomain(domain)
  const displayName =
    name.trim() || (host ? host.split(".")[0]!.replace(/^\w/, (c) => c.toUpperCase()) : "Your product")
  const subdomain = slug.trim() || "your-workspace"
  const showHelp = step === "help" && draftHelp
  const frameRef = React.useRef<HTMLDivElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const scale = useFitScale(frameRef, cardRef)

  return (
    <div
      ref={frameRef}
      className="relative hidden min-h-0 overflow-hidden rounded-lg bg-primary lg:flex lg:h-full lg:items-center lg:justify-center"
    >
      <DitherGradient to="primary" direction="right" cell={3} />
      <div
        ref={cardRef}
        style={
          {
            width: PREVIEW_CARD_WIDTH,
            // The portal's brand colour, not the dashboard's.
            "--primary": PREVIEW_BRAND_PRIMARY,
            "--ring": PREVIEW_BRAND_PRIMARY,
            transform: `scale(${scale ?? 1})`,
            // Hidden until measured, so it doesn't flash at its natural size first.
            visibility: scale ? undefined : "hidden",
          } as React.CSSProperties
        }
        className="relative shrink-0 overflow-hidden rounded-xl border border-black/10 bg-background shadow-2xl shadow-black/25"
      >
        {/* Address bar */}
        <div className="flex items-center gap-3 border-b border-border/60 bg-muted/50 px-3 py-2">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-2.5 rounded-[50%] bg-border" />
            <span className="size-2.5 rounded-[50%] bg-border" />
            <span className="size-2.5 rounded-[50%] bg-border" />
          </span>
          <span className="flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-[10px] text-muted-foreground">
            <LockIcon className="size-2.5 shrink-0" />
            <span className="truncate">
              {workspaceHost(subdomain)}{showHelp ? "/help" : ""}
            </span>
          </span>
          {/* Balances the window dots, so the address sits in the true centre. */}
          <span className="invisible flex gap-1.5" aria-hidden>
            <span className="size-2.5" />
            <span className="size-2.5" />
            <span className="size-2.5" />
          </span>
        </div>

        {/* Portal header and page, at desktop size, as on the subdomain */}
        <DesktopViewport>
          <PortalHeaderPreview domain={domain} name={displayName} active={showHelp ? "Help" : "Feedback"} />
        </DesktopViewport>

        {showHelp ? (
          <DesktopViewport key="help" page className="animate-in fade-in-0 duration-300">
            <HelpHomePreview name={displayName} />
          </DesktopViewport>
        ) : (
          <DesktopViewport key="feedback" page>
            <FeedbackHomePreview name={displayName} />
          </DesktopViewport>
        )}
      </div>
    </div>
  )
}
