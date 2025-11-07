"use client";

import React from "react";
import BackLink from "@/components/tools/global/backlink";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@feedgot/ui/components/card";
import { Label } from "@feedgot/ui/components/label";
import { Input } from "@feedgot/ui/components/input";

const parseNumber = (v: string) => {
  const n = Number((v || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const formatCurrencyExact = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

export default function BurnRateTool() {
  const [cashInflow, setCashInflow] = React.useState("100000");
  const [cashOutflow, setCashOutflow] = React.useState("150000");

  const netBurn = React.useMemo(() => {
    const inflow = parseNumber(cashInflow);
    const outflow = parseNumber(cashOutflow);
    return outflow - inflow; // positive means burning cash
  }, [cashInflow, cashOutflow]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Burn Rate</h2>
        <p>
          Net burn is the monthly cash outflow minus inflow. Formula: <code>Net burn = Outflow − Inflow</code>. Use this calculator to understand monthly cash usage and its impact on runway. Provide monthly inflows and outflows to see net burn in dollars per month.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter monthly cash inflows and outflows.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="in">Cash inflow</Label>
                <Input id="in" type="text" value={cashInflow} onChange={(e) => setCashInflow(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="out">Cash outflow</Label>
                <Input id="out" type="text" value={cashOutflow} onChange={(e) => setCashOutflow(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="netburn">Net burn</Label>
                <Input id="netburn" type="text" value={`${formatCurrencyExact(Math.max(netBurn, 0))} / month`} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-muted">
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Monthly burn overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Net burn</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{`${formatCurrencyExact(Math.max(netBurn, 0))} / month`}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Inflow</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(parseNumber(cashInflow))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Outflow</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(parseNumber(cashOutflow))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Status</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{netBurn <= 0 ? "Positive cash flow" : "Burning cash"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is burn rate?</h3>
          <p>
            Burn rate is the net cash outflow each month. <strong>Net burn</strong> = cash outflow − cash inflow. Some teams also track <em>gross</em> burn (outflow only), but net burn is more informative.
          </p>
          <h3>Why it matters</h3>
          <ul>
            <li>Determines runway and how quickly you must grow or raise.</li>
            <li>Helps spot unsustainable spend before it becomes a crisis.</li>
            <li>Aligns the team on cost discipline and efficiency initiatives.</li>
          </ul>
          <h3>How to calculate</h3>
          <p>Net burn = Monthly cash outflow − Monthly cash inflow. Report in absolute dollars per month.</p>
          <h3>Example</h3>
          <p>Outflow {formatCurrencyExact(parseNumber(cashOutflow))}/mo, inflow {formatCurrencyExact(parseNumber(cashInflow))}/mo ⇒ Net burn {`${formatCurrencyExact(Math.max(netBurn, 0))} / month`}.</p>
          <h3>Tips to reduce burn</h3>
          <ul>
            <li>Focus spend on high‑ROI channels; trim low‑impact projects.</li>
            <li>Improve margins by renegotiating vendors and optimizing infra.</li>
            <li>Increase cash collections (billing cadence, dunning, discounts for prepay).</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>Which burn should I report—gross or net?</strong> Report net; it captures inflows and reflects actual cash usage.</p>
          <p><strong>Is high burn always bad?</strong> Not if ROI is compelling and cash runway is sufficient; monitor carefully.</p>
          <p><strong>How often should burn be tracked?</strong> Weekly for ops, monthly for reporting; alert on large spikes.</p>
          <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is burn rate?","acceptedAnswer":{"@type":"Answer","text":"Burn rate is the net monthly cash outflow (outflow minus inflow)."}},{"@type":"Question","name":"Should I report gross or net burn?","acceptedAnswer":{"@type":"Answer","text":"Net burn is more informative because it includes inflows."}},{"@type":"Question","name":"Is a high burn rate always bad?","acceptedAnswer":{"@type":"Answer","text":"Not necessarily—if ROI is strong and runway is sufficient."}}]})}</script>
        </div>
      </div>
    </div>
  );
}