"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@feedgot/ui/components/card"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"
import { Button } from "@feedgot/ui/components/button"
import StatusBadge from "@/components/tools/global/status-badge"

export default function StickinessCalculator() {
  const [dau, setDau] = useState<number>(1200)
  const [wau, setWau] = useState<number>(3000)
  const [mau, setMau] = useState<number>(5000)

  const metrics = useMemo(() => {
    const safe = (n: number) => (isFinite(n) ? n : 0)
    const sDauMau = safe(mau) > 0 ? (safe(dau) / safe(mau)) * 100 : 0
    const sWauMau = safe(mau) > 0 ? (safe(wau) / safe(mau)) * 100 : 0
    const status = sDauMau >= 40 ? "Strong" : sDauMau >= 20 ? "Moderate" : "Low"
    return { sDauMau, sWauMau, status }
  }, [dau, wau, mau])

  const fmtPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Stickiness calculator (DAU/MAU)</h2>
        <p>
          Stickiness estimates habit formation by comparing daily or weekly active users to monthly active users.
          A common benchmark is <code>DAU ÷ MAU × 100%</code>. Higher stickiness suggests users return frequently and find ongoing value.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter active user counts for the period. Summary updates instantly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="dau">DAU (daily active users)</Label>
                <Input
                  id="dau"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={isFinite(dau) ? dau : 0}
                  onChange={(e) => setDau(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="wau">WAU (weekly active users)</Label>
                <Input
                  id="wau"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={isFinite(wau) ? wau : 0}
                  onChange={(e) => setWau(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="mau">MAU (monthly active users)</Label>
                <Input
                  id="mau"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={isFinite(mau) ? mau : 0}
                  onChange={(e) => setMau(Number(e.target.value))}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-sm text-zinc-500">
              DAU/MAU <span className="font-mono ml-1 text-foreground">{fmtPct(metrics.sDauMau)}</span>
            </div>
            <StatusBadge status={metrics.status as any} />
          </CardFooter>
        </Card>

        <Card className="bg-muted">
          <CardHeader className="tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Stickiness ratios derived from your inputs.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">DAU/MAU</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{fmtPct(metrics.sDauMau)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">WAU/MAU</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{fmtPct(metrics.sWauMau)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">Status</div>
                <div className="mt-1 text-base leading-tight">{metrics.status}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-zinc-500">MAU</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{isFinite(mau) ? mau.toLocaleString() : 0}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Interpreting stickiness</h3>
        <p>
          Stickiness highlights how frequently users engage within a month. Products with strong habit loops often see
          DAU/MAU above 20–40%. Consumer social and messaging can exceed 50%, while B2B workflows typically range lower.
        </p>
        <h4>Benchmarks</h4>
        <ul>
          <li><strong>&gt;= 40%</strong> Strong: habitual daily use for many users.</li>
          <li><strong>20–40%</strong> Moderate: regular weekly use; good engagement.</li>
          <li><strong>&lt; 20%</strong> Low: infrequent use or niche cadence.</li>
        </ul>
        <h4>Improve stickiness</h4>
        <ul>
          <li>Shorten time to value and reduce friction in repeat workflows.</li>
          <li>Use reminders and in‑product cues aligned to genuine user value.</li>
          <li>Build features that anchor recurring tasks, not just one‑off actions.</li>
        </ul>
      </section>
    </div>
  )
}