"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@feedgot/ui/components/card"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"

export default function ActivationRateTool() {
  const [signups, setSignups] = useState<string>("500")
  const [activated, setActivated] = useState<string>("320")

  const activation = useMemo(() => {
    const s = Number(signups)
    const a = Number(activated)
    return Number.isFinite(s) && s > 0 && Number.isFinite(a) ? (a / s) * 100 : 0
  }, [signups, activated])

  const formatPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Activation Rate</h2>
        <p>
          Activation rate measures how many new signups complete the key onboarding milestone.
          Formula: <code>Activation rate = Activated users ÷ New signups × 100%</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter signups and activated users for the period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="signups">New signups</Label>
                <Input id="signups" type="text" value={signups} onChange={(e) => setSignups(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="activated">Activated users</Label>
                <Input id="activated" type="text" value={activated} onChange={(e) => setActivated(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="activation">Activation rate</Label>
                <Input id="activation" type="text" value={formatPct(activation)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Onboarding completion for the cohort.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Activation rate</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(activation)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Signups</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{signups.toLocaleString()}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Activated</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{activated.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Best practices</h3>
        <ul>
          <li>Define a clear activation milestone tied to product value.</li>
          <li>Measure time‑to‑activation and drop‑off to improve onboarding.</li>
          <li>Segment by acquisition source and plan to target improvements.</li>
        </ul>
      </section>
    </div>
  )
}