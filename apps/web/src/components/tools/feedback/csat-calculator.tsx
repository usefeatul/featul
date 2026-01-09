"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

function getScoreLabel(score: number): { label: string; color: string; description: string } {
    if (score >= 80) return { label: "Excellent", color: "text-green-600 dark:text-green-400", description: "Outstanding satisfaction" }
    if (score >= 60) return { label: "Good", color: "text-blue-600 dark:text-blue-400", description: "Above average satisfaction" }
    if (score >= 40) return { label: "Fair", color: "text-yellow-600 dark:text-yellow-400", description: "Room for improvement" }
    if (score >= 20) return { label: "Poor", color: "text-orange-600 dark:text-orange-400", description: "Needs attention" }
    return { label: "Critical", color: "text-red-600 dark:text-red-400", description: "Immediate action required" }
}

export default function CsatCalculatorTool() {
    const [satisfied, setSatisfied] = useState<string>("85")
    const [neutral, setNeutral] = useState<string>("10")
    const [dissatisfied, setDissatisfied] = useState<string>("5")

    const metrics = useMemo(() => {
        const sat = Number(satisfied)
        const neu = Number(neutral)
        const dis = Number(dissatisfied)

        if (![sat, neu, dis].every(Number.isFinite) || [sat, neu, dis].some(n => n < 0)) {
            return { total: 0, csat: 0, satisfiedPct: 0, neutralPct: 0, dissatisfiedPct: 0 }
        }

        const total = sat + neu + dis
        if (total === 0) {
            return { total: 0, csat: 0, satisfiedPct: 0, neutralPct: 0, dissatisfiedPct: 0 }
        }

        // CSAT = (Satisfied responses / Total responses) × 100
        const csat = (sat / total) * 100
        const satisfiedPct = (sat / total) * 100
        const neutralPct = (neu / total) * 100
        const dissatisfiedPct = (dis / total) * 100

        return { total, csat, satisfiedPct, neutralPct, dissatisfiedPct }
    }, [satisfied, neutral, dissatisfied])

    const scoreInfo = getScoreLabel(metrics.csat)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>CSAT Calculator</h2>
                <p>
                    Calculate your Customer Satisfaction Score (CSAT) to measure how satisfied customers are with your product, service, or interaction.
                </p>
                <p>
                    Formula: <code>CSAT = (Satisfied Responses ÷ Total Responses) × 100</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Survey Responses</CardTitle>
                        <CardDescription>Enter the number of responses for each satisfaction level.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="satisfied">Satisfied (4-5 rating)</Label>
                                <Input
                                    id="satisfied"
                                    type="number"
                                    min="0"
                                    value={satisfied}
                                    onChange={(e) => setSatisfied(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="neutral">Neutral (3 rating)</Label>
                                <Input
                                    id="neutral"
                                    type="number"
                                    min="0"
                                    value={neutral}
                                    onChange={(e) => setNeutral(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dissatisfied">Dissatisfied (1-2 rating)</Label>
                                <Input
                                    id="dissatisfied"
                                    type="number"
                                    min="0"
                                    value={dissatisfied}
                                    onChange={(e) => setDissatisfied(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Your CSAT Score</CardTitle>
                        <CardDescription>Customer satisfaction percentage.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className={`text-5xl font-bold ${scoreInfo.color}`}>{metrics.csat.toFixed(1)}%</div>
                                <div className={`text-sm mt-1 ${scoreInfo.color}`}>{scoreInfo.label}</div>
                                <div className="text-xs text-accent mt-0.5">{scoreInfo.description}</div>
                            </div>
                            <div className="flex-1 max-w-xs">
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                                        style={{ width: `${metrics.csat}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Response Distribution</CardTitle>
                        <CardDescription>Breakdown of survey responses.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Total Responses</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.total.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border border-green-200 dark:border-green-800 p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-green-600 dark:text-green-400">Satisfied</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.satisfiedPct.toFixed(1)}%</div>
                            </div>
                            <div className="rounded-md border border-yellow-200 dark:border-yellow-800 p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-yellow-600 dark:text-yellow-400">Neutral</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.neutralPct.toFixed(1)}%</div>
                            </div>
                            <div className="rounded-md border border-red-200 dark:border-red-800 p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-red-600 dark:text-red-400">Dissatisfied</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.dissatisfiedPct.toFixed(1)}%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Understanding CSAT</h3>
                <p>
                    CSAT measures immediate satisfaction with a specific interaction, product, or service. It&apos;s typically measured on a 1-5 scale.
                </p>

                <h4>Industry Benchmarks</h4>
                <ul>
                    <li><strong>80%+</strong> — Excellent, world-class satisfaction</li>
                    <li><strong>60-80%</strong> — Good, above average</li>
                    <li><strong>40-60%</strong> — Fair, room for improvement</li>
                    <li><strong>Below 40%</strong> — Poor, needs immediate attention</li>
                </ul>

                <h4>How to Improve CSAT</h4>
                <ul>
                    <li>Respond quickly to customer inquiries.</li>
                    <li>Train support teams on empathy and problem-solving.</li>
                    <li>Follow up with dissatisfied customers.</li>
                    <li>Act on feedback to fix recurring issues.</li>
                </ul>
            </section>
        </div>
    )
}
