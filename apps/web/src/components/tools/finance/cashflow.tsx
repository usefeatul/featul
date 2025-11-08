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

export default function CashFlowTool() {
  const [beginCash, setBeginCash] = React.useState("100000");
  const [operating, setOperating] = React.useState("25000");
  const [investing, setInvesting] = React.useState("-10000");
  const [financing, setFinancing] = React.useState("0");

  const netChange = React.useMemo(() => {
    return (
      parseNumber(operating) + parseNumber(investing) + parseNumber(financing)
    );
  }, [operating, investing, financing]);

  const endCash = React.useMemo(() => {
    return parseNumber(beginCash) + netChange;
  }, [beginCash, netChange]);

  return (
    <div>
      <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
        <h2>Cash Flow</h2>
        <p>
          Summarize cash flows by activity. Formula: <code>Net change = Operating + Investing + Financing</code>. Use this calculator to reconcile cash movement across operating, investing, and financing activities. Enter beginning cash and each activity’s cash flows to see net change and ending cash.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Enter beginning cash and cash flows by activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 items-end">
              <div className="space-y-1">
                <Label htmlFor="begin">Beginning cash</Label>
                <Input id="begin" type="text" value={beginCash} onChange={(e) => setBeginCash(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="op">Operating cash flow</Label>
                <Input id="op" type="text" value={operating} onChange={(e) => setOperating(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="inv">Investing cash flow</Label>
                <Input id="inv" type="text" value={investing} onChange={(e) => setInvesting(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="fin">Financing cash flow</Label>
                <Input id="fin" type="text" value={financing} onChange={(e) => setFinancing(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="change">Net change</Label>
                <Input id="change" type="text" value={formatCurrencyExact(netChange)} readOnly />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 tracking-wide">
            <CardTitle className="text-base">Summary</CardTitle>
            <CardDescription>Net change and ending cash.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Net change</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(netChange)}</div>
              </div>
              <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                <div className="text-xs text-accent">Ending cash</div>
                <div className="mt-1 font-mono text-base leading-tight text-foreground">{formatCurrencyExact(endCash)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <BackLink />

        <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6">
          <h3>What is cash flow?</h3>
          <p>
            Cash flow tracks money moving in and out of the business across <strong>operating</strong>, <strong>investing</strong>, and
            <strong> financing</strong> activities. It reveals liquidity and the ability to fund operations without new capital.
          </p>
          <h3>Why it matters</h3>
          <ul>
            <li>Shows whether growth is self‑funded or reliant on external financing.</li>
            <li>Highlights working capital needs and timing mismatches.</li>
            <li>Complements profitability metrics with real cash movement.</li>
          </ul>
          <h3>How to calculate</h3>
          <p>Net change = Operating + Investing + Financing. Ending cash = Beginning cash + Net change.</p>
          <h3>Example</h3>
          <p>Operating {formatCurrencyExact(parseNumber(operating))}, Investing {formatCurrencyExact(parseNumber(investing))}, Financing {formatCurrencyExact(parseNumber(financing))} ⇒ Net change {formatCurrencyExact(netChange)} and Ending cash {formatCurrencyExact(endCash)}.</p>
          <h3>Common pitfalls</h3>
          <ul>
            <li>Confusing profitability with cash flow; revenue recognition differs from cash timing.</li>
            <li>Ignoring deferred revenue and payables/receivables swings.</li>
            <li>Not separating one‑time financing activities from recurring operations.</li>
          </ul>
          <h3>FAQ</h3>
          <p><strong>Is positive operating cash flow required to be healthy?</strong> It’s a strong signal but early growth may be investing in acquisition.</p>
          <p><strong>How often should cash flow be reviewed?</strong> Monthly management reporting and quarterly board reviews are common.</p>
          <p><strong>How does cash flow relate to runway?</strong> Persistent negative operating cash flow increases burn and shortens runway.</p>
          <script type="application/ld+json" suppressHydrationWarning>{JSON.stringify({"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"What is cash flow?","acceptedAnswer":{"@type":"Answer","text":"Cash flow is the net movement of cash across operating, investing, and financing activities."}},{"@type":"Question","name":"How often should cash flow be reviewed?","acceptedAnswer":{"@type":"Answer","text":"Monthly for management and quarterly for board reviews are typical."}},{"@type":"Question","name":"How does cash flow affect runway?","acceptedAnswer":{"@type":"Answer","text":"Negative operating cash flow increases burn and reduces runway."}}]})}</script>
        </div>
      </div>
    </div>
  );
}