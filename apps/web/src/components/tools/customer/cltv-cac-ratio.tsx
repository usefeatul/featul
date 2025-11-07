"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@feedgot/ui/components/card"
import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"

export default function CltvCacRatioTool() {
  const [cltv, setCltv] = useState<string>("400")
  const [cac, setCac] = useState<string>("125")

  const ratio = useMemo(() => {
    const l = Number(cltv)
    const c = Number(cac)
    return Number.isFinite(l) && Number.isFinite(c) && c > 0 ? l / c : 0
  }, [cltv, cac])

  const formatCurrencyExact = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD" })
  const formatRatio = (n: number) => (Number.isFinite(n) && n > 0 ? `${n.toFixed(2)}x` : "0.00x")

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>CLTV/CAC Ratio</h2>
        <p>
          The CLTV/CAC ratio compares lifetime value to acquisition cost. Healthy SaaS often targets <code>≥ 3x</code>.
          Formula: <code>CLTV/CAC = Customer lifetime value ÷ Customer acquisition cost</code>.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter CLTV and CAC, or copy LTV from the LTV tool.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="cltv">CLTV (LTV)</Label>
                <Input id="cltv" type="text" value={cltv} onChange={(e) => setCltv(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="cac">CAC</Label>
                <Input id="cac" type="text" value={cac} onChange={(e) => setCac(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="ratio">CLTV/CAC</Label>
                <Input id="ratio" type="text" value={formatRatio(ratio)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Value generated per $1 of acquisition spend.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">CLTV/CAC</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatRatio(ratio)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">CLTV</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(Number(cltv))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">CAC</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(Number(cac))}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />
      </div>

      <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
        <h3>Interpretation</h3>
        <ul>
          <li><strong>≥ 3x</strong> is commonly cited as efficient growth.</li>
          <li><strong>1–3x</strong> suggests tighter unit economics; revisit pricing or efficiency.</li>
          <li><strong>&lt; 1x</strong> indicates value is less than cost—unsustainable without change.</li>
        </ul>

        <h4>Tips</h4>
        <ul>
          <li>Use gross‑margin adjusted LTV for accurate comparisons.</li>
          <li>Segment by channel and cohort to spot differences in efficiency.</li>
        </ul>
      </section>
    </div>
  )
}