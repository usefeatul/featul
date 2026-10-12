"use client"

import { useState, useSyncExternalStore } from "react"
import { usePathname } from "next/navigation"
import { Button } from "@featul/ui/components/button"
import { browserForbidsAnalytics, readAnalyticsConsent, subscribeAnalyticsConsent, writeAnalyticsConsent } from "@featul/ui/lib/consent"

export default function AnalyticsConsent() {
  const consent = useSyncExternalStore(subscribeAnalyticsConsent, readAnalyticsConsent, () => null)
  const blocked = useSyncExternalStore(subscribeAnalyticsConsent, browserForbidsAnalytics, () => false)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN || pathname.startsWith("/widget")) return null
  if (consent !== null && !open) return (
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-3 left-3 z-50 rounded-md border bg-background px-3 py-1.5 text-xs text-muted-foreground shadow-sm hover:text-foreground">
      Privacy choices
    </button>
  )
  const choose = (value: "granted" | "denied") => { writeAnalyticsConsent(value); setOpen(false) }
  return (
    <section aria-label="Analytics preferences" className="fixed bottom-3 left-3 right-3 z-50 max-w-md rounded-xl border bg-background p-4 text-foreground shadow-lg">
      <h2 className="text-sm font-semibold">Optional product analytics</h2>
      <p className="mt-2 text-sm text-muted-foreground">Allow usage analytics to help improve Featul? Your choice won’t affect access. You can change it here at any time.</p>
      <a href="https://featul.com/privacy" className="mt-2 inline-block text-sm underline">Privacy notice</a>
      <div className="mt-3 flex gap-2">
        <Button variant="outline" onClick={() => choose("denied")}>Reject analytics</Button>
        <Button variant="outline" disabled={blocked} onClick={() => choose("granted")}>Allow analytics</Button>
      </div>
    </section>
  )
}
