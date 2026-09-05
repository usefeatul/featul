import {
  OverlayCard,
  OverlayCardPanel,
} from "@/components/shared/overlay-card"
import { PreferredSourceButton } from "@/components/preferred-source/button"

export function PreferredSourceCard() {
  return (
    <aside className="mt-10 w-full" aria-label="Preferred source on Google">
      <OverlayCard>
        <OverlayCardPanel className="flex flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h2 className="font-heading text-sm font-semibold tracking-tight text-foreground">
              See us more often in Google
            </h2>
            <p className="mt-1.5 text-xs leading-5 text-accent">
              One click marks Featul as a preferred source, so our articles sit
              higher in your Top Stories, AI Mode, and AI Overviews.
            </p>
          </div>
          <PreferredSourceButton className="w-full shrink-0 sm:w-auto" />
        </OverlayCardPanel>
      </OverlayCard>
    </aside>
  )
}
