"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@oreilla/ui/components/card"
import { Label } from "@oreilla/ui/components/label"
import { Input } from "@oreilla/ui/components/input"
import StatusBadge from "@/components/tools/global/status-badge"
import { Button } from "@oreilla/ui/components/button"
import { Plus, Trash } from "lucide-react"

type Cohort = { size: number; adopted: number }

export default function FeatureAdoptionTool() {
  const [cohorts, setCohorts] = useState<Cohort[]>([
    { size: 100, adopted: 45 },
    { size: 80, adopted: 32 },
    { size: 60, adopted: 21 },
  ])

  const totals = useMemo(() => {
    const size = cohorts.reduce((s, c) => s + (isFinite(c.size) ? c.size : 0), 0)
    const adopted = cohorts.reduce((s, c) => s + (isFinite(c.adopted) ? c.adopted : 0), 0)
    const rate = size > 0 ? (adopted / size) * 100 : 0
    const status = rate >= 40 ? "Strong" : rate >= 20 ? "Moderate" : "Low"
    return { size, adopted, rate, status }
  }, [cohorts])

  const updateCohort = (idx: number, patch: Partial<Cohort>) => {
    setCohorts((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)))
  }

  const formatPct = (n: number) => `${n.toFixed(1)}%`

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Feature adoption calculator</h2>
        <p>
          Measure how many eligible users adopt a new feature across cohorts. Adoption rate is
          <code>adopters ÷ eligible users × 100%</code>. Use cohort inputs below to see overall adoption and
          per‑cohort performance.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Cohort inputs</CardTitle>
            <CardDescription>
              Add cohorts and enter the number of eligible users and adopters. The summary updates instantly.
            </CardDescription>
            <CardAction>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCohorts((prev) => [...prev, { size: 50, adopted: 20 }])}
              >
                <Plus className="mr-1" /> Add cohort
              </Button>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cohorts.map((c, i) => (
                <div key={i} className="grid grid-cols-4 sm:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1">
                    <Label htmlFor={`size-${i}`}>Cohort size</Label>
                    <Input
                      id={`size-${i}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={isFinite(c.size) ? c.size : 0}
                      onChange={(e) => updateCohort(i, { size: Number(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor={`adopted-${i}`}>Adopted</Label>
                    <Input
                      id={`adopted-${i}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={isFinite(c.adopted) ? c.adopted : 0}
                      onChange={(e) => updateCohort(i, { adopted: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex justify-end self-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => setCohorts((prev) => prev.filter((_, idx) => idx !== i))}
                      aria-label={`Remove cohort ${i + 1}`}
                    >
                      <Trash className="mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter className="justify-between">
            <div className="text-sm text-accent">
              Overall adoption <span className="font-mono ml-1 text-foreground">{formatPct(totals.rate)}</span>
            </div>
            <StatusBadge status={totals.status as "Low" | "Moderate" | "Strong"} />
          </CardFooter>
        </Card>

      {/* Summary card stacked below inputs */}
        <Card >
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Overall adoption across cohorts. Tiles show key metrics.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Adoption rate</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatPct(totals.rate)}</div>
              </div>
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Status</div>
                <div className="mt-1 text-base leading-tight">{totals.status}</div>
              </div>
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Adopters</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{totals.adopted.toLocaleString()}</div>
              </div>
              <div className="rounded-md  border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Eligible users</div>
                <div className="mt-1 font-mono text-base leading-tight tabular-nums">{totals.size.toLocaleString()}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Feature adoption explained</h3>
        <p>
          Feature adoption measures the share of eligible users who have successfully used a new capability at least
          once. It is a leading indicator for product discovery, onboarding quality, and time‑to‑value.
        </p>
        <p>
          Formula: <code>adoption (%) = adopters ÷ eligible users × 100</code>. Adoption is related to activation and
          retention but not the same: activation checks whether a user completes the necessary setup; adoption checks if
          they actually use the feature; retention checks if they keep using it over time.
        </p>

        <h4>What each input means</h4>
        <ul>
          <li>
            <strong>Cohort size</strong>: Number of <em>eligible</em> users in the cohort. Eligibility means the user could
            reasonably access the feature (correct plan, permissions, platform, etc.).
          </li>
          <li>
            <strong>Adopted</strong>: Count of users who used the feature at least once in the period.
          </li>
        </ul>

        <h4>How to use the calculator</h4>
        <ol>
          <li>Add one or more cohorts that reflect how you roll out or segment users.</li>
          <li>Enter the eligible users and the number who adopted the feature.</li>
          <li>Read the summary for overall adoption rate and status.</li>
          <li>Compare cohorts to spot areas needing better onboarding or messaging.</li>
        </ol>

        <h4>Interpreting results</h4>
        <ul>
          <li>
            <strong>{formatPct(totals.rate)}</strong> overall adoption today. Status is shown as <strong>{totals.status}</strong> to
            provide quick guidance.
          </li>
          <li>Below ~20% usually signals discoverability or eligibility issues.</li>
          <li>20–40% is moderate; users find it but may not yet see strong value.</li>
          <li>40%+ indicates good adoption for broad features. Niche features can be healthy at lower levels.</li>
        </ul>

        <h4>Example</h4>
        <p>
          With {totals.size.toLocaleString()} eligible users across the cohorts above and
          {" "}{totals.adopted.toLocaleString()} adopters, the adoption rate is
          {" "}<code>{formatPct(totals.rate)}</code>. If adoption is lower than expected, focus on eligibility checks,
          in‑product prompts, and first‑time guidance.
        </p>

        <h4>Benchmarks and pitfalls</h4>
        <ul>
          <li>Benchmarks vary by product type, audience, and feature scope. Use internal baselines first.</li>
          <li>Do not count page views or impressions as adoption; require a verifiable action.</li>
          <li>Ensure the denominator is truly eligible users to avoid under‑ or over‑stating adoption.</li>
          <li>Watch seasonality and rollout timing; compare like‑for‑like periods.</li>
        </ul>

        <h4>Ways to improve adoption</h4>
        <ul>
          <li>Announce in context near related workflows, not just via global banners.</li>
          <li>Offer lightweight guidance (tooltips, hints) over blocking modals.</li>
          <li>Instrument first‑use and repeat‑use separately to understand depth of value.</li>
          <li>Target cohorts with lower adoption using tailored nudges or examples.</li>
        </ul>

        <h4>Related metrics to track</h4>
        <ul>
          <li>Activation completion rate for prerequisites.</li>
          <li>Repeat usage frequency (weekly or monthly).</li>
          <li>Task success rate and time‑to‑value for feature‑related flows.</li>
        </ul>
      </section>
    </div>
  )
}
