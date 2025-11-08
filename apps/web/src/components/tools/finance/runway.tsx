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

export default function RunwayTool() {
  const [cash, setCash] = React.useState("100000");
  const [monthlyBurn, setMonthlyBurn] = React.useState("25000");

  const runwayMonths = React.useMemo(() => {
    const c = parseNumber(cash);
    const b = parseNumber(monthlyBurn);
    if (b <= 0) return 0;
    return c / b;
  }, [cash, monthlyBurn]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Runway</h2>
        <p>
          Estimate months of runway given current cash and net monthly burn. Formula: <code>Runway = Cash ÷ Net burn</code>. Use this calculator to understand how long your cash reserves last at the current burn rate. Enter cash on hand and <em>net</em> monthly burn (outflow minus inflow) to see runway in months.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter current cash and monthly net burn.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="cash">Current cash</Label>
                <Input id="cash" type="text" value={cash} onChange={(e) => setCash(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="burn">Monthly net burn</Label>
                <Input id="burn" type="text" value={monthlyBurn} onChange={(e) => setMonthlyBurn(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="months">Runway (months)</Label>
                <Input id="months" type="text" value={runwayMonths ? runwayMonths.toFixed(1) : "—"} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Runway and inputs overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Runway</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{runwayMonths ? runwayMonths.toFixed(1) : "—"} mo</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Cash</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(parseNumber(cash))}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Net burn</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(parseNumber(monthlyBurn))}/mo</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is startup runway?</h3>
          <p>
            Runway is the number of months your company can operate before cash runs out, given today’s
            <strong className="font-semibold"> net monthly burn</strong>. Use <em>net</em> burn (cash outflow minus cash inflow) rather than gross burn to avoid overstating risk.
          </p>
          <h3>Why runway matters</h3>
          <ul>
            <li>Sets how much time you have to iterate, hire, and fundraise.</li>
            <li>Helps plan cost reductions or growth investments responsibly.</li>
            <li>Aligns stakeholders on timing for the next financing or breakeven.</li>
          </ul>
          <h3>How to calculate</h3>
          <p>Runway = Current cash ÷ Net monthly burn. If net burn ≤ 0, you have non‑negative burn and effectively infinite runway while that condition holds.</p>
          <h3>Example</h3>
          <p>With {formatCurrencyExact(parseNumber(cash))} in cash and {formatCurrencyExact(parseNumber(monthlyBurn))}/mo burn, runway ≈ {runwayMonths ? runwayMonths.toFixed(1) : "—"} months.</p>
          <h3>Tips to extend runway</h3>
          <ul>
            <li>Prioritize high‑ROI initiatives; pause low‑impact spend.</li>
            <li>Renegotiate contracts and consolidate tooling where feasible.</li>
            <li>Improve gross margin (pricing, packaging, lower COGS) to reduce burn.</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>Is runway based on net or gross burn?</strong> Use net burn (outflow − inflow). Gross burn ignores inflows and overstates risk.</p>
          <p><strong>What’s a good runway?</strong> 12–18 months is common for SaaS to safely iterate and raise; longer if sales cycles are slow.</p>
          <p><strong>How often should I recalculate?</strong> Monthly, or anytime burn or cash position changes materially.</p>
          <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is startup runway?","acceptedAnswer":{"@type":"Answer","text":"Runway is the number of months current cash covers given net monthly cash burn."}},{"@type":"Question","name":"Is runway based on net or gross burn?","acceptedAnswer":{"@type":"Answer","text":"Use net burn (outflow minus inflow). Gross burn overstates cash usage."}},{"@type":"Question","name":"What’s a good runway for a SaaS startup?","acceptedAnswer":{"@type":"Answer","text":"Aim for 12–18 months to iterate and fundraise; more if cycles are long."}}]})}</script>
        </div>
      </div>
    </div>
  );
}