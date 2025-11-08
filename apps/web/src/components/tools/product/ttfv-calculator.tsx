"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@feedgot/ui/components/card"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"
import StatusBadge from "@/components/tools/global/status-badge"

export default function TtfvCalculator() {
  const [signups, setSignups] = useState<number>(500)
  const [firstValueUsers, setFirstValueUsers] = useState<number>(320)
  const [windowDays, setWindowDays] = useState<number>(7)

  const metrics = useMemo(() => {
    const safe = (n: number) => (isFinite(n) ? n : 0)
    const rate = safe(signups) > 0 ? (safe(firstValueUsers) / safe(signups)) * 100 : 0
    const status = rate >= 60 ? "Strong" : rate >= 30 ? "Moderate" : "Low"
    return { rate, status }
  }, [signups, firstValueUsers])

  const fmtPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Time to First Value (TTFV)</h2>
        <p>
          TTFV tracks how quickly new users achieve a meaningful outcome. Here we measure the share of signups who reach
          first value within a chosen window. Faster time‑to‑value improves activation and retention.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card >
          <CardHeader className="tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter signups and first‑value completions for the period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="signups">New signups</Label>
                <Input
                  id="signups"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={isFinite(signups) ? signups : 0}
                  onChange={(e) => setSignups(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="firstValue">Users reached first value</Label>
                <Input
                  id="firstValue"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={isFinite(firstValueUsers) ? firstValueUsers : 0}
                  onChange={(e) => setFirstValueUsers(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="window">Window (days)</Label>
                <Input
                  id="window"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={isFinite(windowDays) ? windowDays : 0}
                  onChange={(e) => setWindowDays(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-sm text-accent">
              Within {isFinite(windowDays) ? windowDays : 0} days
              <span className="font-mono ml-1 text-foreground">{fmtPct(metrics.rate)}</span>
            </div>
            <StatusBadge status={metrics.status as any} />
          </CardFooter>
        </Card>

        <Card >
          <CardHeader className="tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>TTFV rate and helpful context.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center">
                <div className="text-xs text-accent">TTFV rate</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{fmtPct(metrics.rate)}</div>
              </div>
              <div className="rounded-md border p-3 text-center">
                <div className="text-xs text-accent">Status</div>
                <div className="mt-1 text-base leading-tight">{metrics.status}</div>
              </div>
              <div className="rounded-md border p-3 text-center">
                <div className="text-xs text-accent">Signups</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{isFinite(signups) ? signups.toLocaleString() : 0}</div>
              </div>
              <div className="rounded-md border p-3 text-center">
                <div className="text-xs text-accent">Reached value</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{isFinite(firstValueUsers) ? firstValueUsers.toLocaleString() : 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Defining first value</h3>
        <p>
          First value should reflect a clear, outcome‑oriented success (e.g., sent first campaign, closed first ticket),
          not just clicking around. Track prerequisites separately under activation to avoid mixing signals.
        </p>
        <h4>Benchmarks</h4>
        <ul>
          <li><strong>&gt;= 60%</strong> Strong: most users succeed quickly.</li>
          <li><strong>30–60%</strong> Moderate: progress, but more guidance may help.</li>
          <li><strong>&lt; 30%</strong> Low: investigate friction and value clarity.</li>
        </ul>
        <h4>Ways to improve</h4>
        <ul>
          <li>Streamline setup and reduce mandatory steps before value.</li>
          <li>Offer guided templates and tailored examples for common jobs‑to‑be‑done.</li>
          <li>Trigger contextual nudges until the first value event occurs.</li>
        </ul>
      </section>
    </div>
  )
}