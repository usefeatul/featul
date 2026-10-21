import { GoogleIcon } from "@featul/ui/icons/google"
import { modalCardInnerClass, modalCardShellClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"
import { PreferredSourceButton } from "@/components/preferred-source/button"

/** Mirrors the app's `SettingsCard`: header row in the shell, content on the inner surface. */
export function PreferredSourceCard() {
  return (
    <aside className="mt-10 w-full" aria-label="Preferred source on Google">
      <section className={cn(modalCardShellClass, "flex min-w-0 flex-col")}>
        <header className="flex flex-wrap items-center justify-between gap-3 px-2.5 py-1.5">
          <div className="flex min-w-0 items-center gap-2.5">
            <div
              aria-hidden
              className="flex size-4 shrink-0 items-center justify-center [&_svg]:size-4"
            >
              <GoogleIcon />
            </div>
            <h2 className="text-sm font-medium leading-6 text-foreground">
              See us more often in Google
            </h2>
          </div>
        </header>
        <div className={cn(modalCardInnerClass, "min-w-0 px-5 py-4")}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <p className="min-w-0 flex-1 text-sm leading-relaxed text-accent wrap-break-word">
              One click marks Featul as a preferred source, so our articles sit
              higher in your Top Stories, AI Mode, and AI Overviews.
            </p>
            <PreferredSourceButton className="w-full shrink-0 sm:w-auto" />
          </div>
        </div>
      </section>
    </aside>
  )
}
