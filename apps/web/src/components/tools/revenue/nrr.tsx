"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

function getNrrLabel(nrr: number): { label: string; color: string; description: string } {
    if (nrr >= 120) return { label: "Excellent", color: "text-green-600 dark:text-green-400", description: "World-class retention" }
    if (nrr >= 100) return { label: "Good", color: "text-blue-600 dark:text-blue-400", description: "Net positive growth from existing" }
    if (nrr >= 90) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400", description: "Slight net loss from existing" }
    return { label: "Poor", color: "text-red-600 dark:text-red-400", description: "Significant revenue loss" }
}

export default function NetRevenueRetentionTool() {
    const [startingMrr, setStartingMrr] = useState<string>("100000")
    const [expansionMrr, setExpansionMrr] = useState<string>("15000")
    const [churnMrr, setChurnMrr] = useState<string>("8000")
    const [contractionMrr, setContractionMrr] = useState<string>("2000")

    const metrics = useMemo(() => {
        const starting = Number(startingMrr)
        const expansion = Number(expansionMrr)
        const churn = Number(churnMrr)
        const contraction = Number(contractionMrr)

        if (![starting, expansion, churn, contraction].every(n => Number.isFinite(n) && n >= 0) || starting === 0) {
            return { nrr: 0, grossRetention: 0, endingMrr: 0, netChange: 0 }
        }

        // NRR = (Starting MRR + Expansion - Churn - Contraction) / Starting MRR × 100
        const endingMrr = starting + expansion - churn - contraction
        const nrr = (endingMrr / starting) * 100

        // Gross Retention Rate = (Starting MRR - Churn - Contraction) / Starting MRR × 100
        const grossRetention = ((starting - churn - contraction) / starting) * 100

        const netChange = expansion - churn - contraction

        return { nrr, grossRetention, endingMrr, netChange }
    }, [startingMrr, expansionMrr, churnMrr, contractionMrr])

    const nrrInfo = getNrrLabel(metrics.nrr)

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Net Revenue Retention (NRR) Calculator</h2>
                <p>
                    Calculate your Net Revenue Retention to measure how much revenue you retain and grow from existing customers over time.
                </p>
                <p>
                    Formula: <code>NRR = (Starting MRR + Expansion - Churn - Contraction) ÷ Starting MRR × 100%</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Revenue Inputs</CardTitle>
                        <CardDescription>Enter your MRR components from existing customers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="startingMrr">Starting MRR ($)</Label>
                                <Input
                                    id="startingMrr"
                                    type="number"
                                    min="0"
                                    value={startingMrr}
                                    onChange={(e) => setStartingMrr(e.target.value)}
                                />
                                <p className="text-xs text-accent">MRR from existing customers at period start</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="expansionMrr">Expansion MRR ($)</Label>
                                <Input
                                    id="expansionMrr"
                                    type="number"
                                    min="0"
                                    value={expansionMrr}
                                    onChange={(e) => setExpansionMrr(e.target.value)}
                                    className="border-green-200 dark:border-green-800"
                                />
                                <p className="text-xs text-accent">Upgrades and add-ons from existing customers</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="churnMrr">Churned MRR ($)</Label>
                                <Input
                                    id="churnMrr"
                                    type="number"
                                    min="0"
                                    value={churnMrr}
                                    onChange={(e) => setChurnMrr(e.target.value)}
                                    className="border-red-200 dark:border-red-800"
                                />
                                <p className="text-xs text-accent">Revenue lost from cancelled customers</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="contractionMrr">Contraction MRR ($)</Label>
                                <Input
                                    id="contractionMrr"
                                    type="number"
                                    min="0"
                                    value={contractionMrr}
                                    onChange={(e) => setContractionMrr(e.target.value)}
                                    className="border-red-200 dark:border-red-800"
                                />
                                <p className="text-xs text-accent">Revenue lost from downgrades</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Net Revenue Retention</CardTitle>
                        <CardDescription>Your dollar-based retention rate.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className={`text-5xl font-bold ${nrrInfo.color}`}>
                                    {metrics.nrr.toFixed(1)}%
                                </div>
                                <div className={`text-sm mt-1 ${nrrInfo.color}`}>{nrrInfo.label}</div>
                                <div className="text-xs text-accent mt-0.5">{nrrInfo.description}</div>
                            </div>
                            <div className="flex-1 max-w-xs">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-accent">NRR</span>
                                        <span className="text-accent">Target: 100%+</span>
                                    </div>
                                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative">
                                        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-zinc-400 dark:bg-zinc-500 z-10" />
                                        <div
                                            className={`h-full transition-all duration-300 ${metrics.nrr >= 100 ? "bg-green-500" : "bg-red-500"
                                                }`}
                                            style={{ width: `${Math.min(metrics.nrr, 150) / 1.5}%` }}
                                        />
                                    </div>
                                    <div className="flex justify-between text-xs text-accent">
                                        <span>0%</span>
                                        <span>100%</span>
                                        <span>150%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Retention Metrics</CardTitle>
                        <CardDescription>Detailed breakdown of retention.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Gross Retention</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.grossRetention.toFixed(1)}%
                                </div>
                                <div className="text-xs text-accent mt-0.5">without expansion</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Starting MRR</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(Number(startingMrr))}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Ending MRR</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(metrics.endingMrr)}
                                </div>
                            </div>
                            <div className={`rounded-md border-2 p-3 text-center flex flex-col items-center justify-center min-h-[72px] ${metrics.netChange >= 0 ? "border-green-500" : "border-red-500"
                                }`}>
                                <div className="text-xs text-accent">Net Change</div>
                                <div className={`mt-1 font-mono text-base leading-tight ${metrics.netChange >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                                    }`}>
                                    {metrics.netChange >= 0 ? "+" : ""}{formatCurrency(metrics.netChange)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Understanding NRR</h3>
                <p>
                    Net Revenue Retention measures your ability to retain and grow revenue from existing customers, excluding new customer acquisition.
                </p>

                <h4>Benchmarks by Company Stage</h4>
                <ul>
                    <li><strong>120%+</strong> — Best-in-class (Snowflake, Twilio)</li>
                    <li><strong>100-120%</strong> — Strong SaaS performance</li>
                    <li><strong>90-100%</strong> — Acceptable for early-stage</li>
                    <li><strong>&lt;90%</strong> — Concerning, requires attention</li>
                </ul>

                <h4>NRR vs Gross Retention</h4>
                <ul>
                    <li><strong>Gross Retention</strong> caps at 100%—measures only losses.</li>
                    <li><strong>Net Retention</strong> can exceed 100% when expansion outpaces churn.</li>
                    <li>Both are important: Gross shows churn risk, Net shows growth potential.</li>
                </ul>

                <h4>Improving NRR</h4>
                <ul>
                    <li>Build expansion revenue through upsells and cross-sells.</li>
                    <li>Reduce churn with proactive customer success.</li>
                    <li>Price based on usage or value metrics.</li>
                    <li>Invest in product stickiness and integrations.</li>
                </ul>
            </section>
        </div>
    )
}
