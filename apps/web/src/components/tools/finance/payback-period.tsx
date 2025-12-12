"use client";

import React from "react";
import BackLink from "@/components/tools/global/backlink";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@oreilla/ui/components/card";
import { Label } from "@oreilla/ui/components/label";
import { Input } from "@oreilla/ui/components/input";

const parseNumber = (v: string) => {
  const n = Number((v || "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const formatNumber = (n: number) => n.toFixed(1);

export default function PaybackPeriodTool() {
  const [cac, setCac] = React.useState("250");
  const [arpu, setArpu] = React.useState("50");
  const [grossMarginPct, setGrossMarginPct] = React.useState("80");

  const months = React.useMemo(() => {
    const c = parseNumber(cac);
    const a = parseNumber(arpu);
    const gm = parseNumber(grossMarginPct) / 100;
    const denom = a * gm;
    if (denom <= 0) return 0;
    return c / denom;
  }, [cac, arpu, grossMarginPct]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Payback Period</h2>
        <p>
          Months to recover CAC given ARPU and gross margin. Formula: <code>Payback = CAC ÷ (ARPU × Gross margin)</code>. Use this calculator to estimate how many months it takes to recover customer acquisition cost. Enter CAC, monthly ARPU, and gross margin percentage.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter CAC, ARPU and gross margin.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="cac">CAC</Label>
                <Input id="cac" type="text" value={cac} onChange={(e) => setCac(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="arpu">ARPU (monthly)</Label>
                <Input id="arpu" type="text" value={arpu} onChange={(e) => setArpu(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="gm">Gross margin (%)</Label>
                <Input id="gm" type="text" value={grossMarginPct} onChange={(e) => setGrossMarginPct(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="pb">Payback period</Label>
                <Input id="pb" type="text" value={`${formatNumber(months)} months`} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Payback and inputs overview.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Payback</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{`${formatNumber(months)} months`}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">CAC</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{parseNumber(cac).toLocaleString()}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">ARPU</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{parseNumber(arpu).toLocaleString()}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Gross margin</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{`${parseNumber(grossMarginPct).toFixed(0)}%`}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is CAC payback?</h3>
          <p>
            CAC payback is the time it takes for gross profit from a customer to recover the cost to acquire them.
            It connects acquisition efficiency to monetization quality.
          </p>
          <h3>Why it matters</h3>
          <ul>
            <li>Shorter payback reduces capital needs and improves scalability.</li>
            <li>Signals pricing power and retention; long payback hints at issues.</li>
            <li>Common SaaS benchmark: &lt; 12 months is strong for SMB motion.</li>
          </ul>
          <h3>How to calculate</h3>
          <p>Payback (months) = CAC ÷ (ARPU × Gross margin%). Use monthly ARPU and margin for consistency.</p>
          <h3>Example</h3>
          <p>CAC {parseNumber(cac).toLocaleString()}, ARPU {parseNumber(arpu).toLocaleString()}, GM {parseNumber(grossMarginPct).toFixed(0)}% ⇒ Payback {`${formatNumber(months)} months`}.</p>
          <h3>Common pitfalls</h3>
          <ul>
            <li>Ignoring churn—poor retention inflates true payback.</li>
            <li>Mixing annual ARPU with monthly margin; keep periods aligned.</li>
            <li>Excluding onboarding costs that delay monetization.</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>What is a good CAC payback?</strong> Under 12 months for SMB; enterprise can tolerate longer with large deals.</p>
          <p><strong>Should I use gross or net revenue?</strong> Use ARPU and gross margin to reflect delivery costs.</p>
          <p><strong>How does churn affect payback?</strong> High churn reduces lifetime gross profit, effectively lengthening payback.</p>
        </div>
      </div>
    </div>
  );
}