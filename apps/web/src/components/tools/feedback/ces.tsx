"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

function getScoreLabel(score: number): { label: string; color: string; description: string } {
    if (score <= 2) return { label: "Low Effort", color: "text-green-600 dark:text-green-400", description: "Excellent experience" }
    if (score <= 3) return { label: "Moderate Effort", color: "text-blue-600 dark:text-blue-400", description: "Good experience" }
    if (score <= 4) return { label: "Acceptable Effort", color: "text-yellow-600 dark:text-yellow-400", description: "Room to improve" }
    if (score <= 5) return { label: "High Effort", color: "text-orange-600 dark:text-orange-400", description: "Frustrating experience" }
    return { label: "Very High Effort", color: "text-red-600 dark:text-red-400", description: "Poor experience" }
}

export default function CesCalculatorTool() {
    const [score1, setScore1] = useState<string>("5")
    const [score2, setScore2] = useState<string>("10")
    const [score3, setScore3] = useState<string>("25")
    const [score4, setScore4] = useState<string>("40")
    const [score5, setScore5] = useState<string>("30")
    const [score6, setScore6] = useState<string>("12")
    const [score7, setScore7] = useState<string>("8")

    const metrics = useMemo(() => {
        const scores = [
            { value: 1, count: Number(score1) },
            { value: 2, count: Number(score2) },
            { value: 3, count: Number(score3) },
            { value: 4, count: Number(score4) },
            { value: 5, count: Number(score5) },
            { value: 6, count: Number(score6) },
            { value: 7, count: Number(score7) },
        ]

        if (!scores.every(s => Number.isFinite(s.count) && s.count >= 0)) {
            return { total: 0, ces: 0, distribution: scores.map(s => ({ ...s, percent: 0 })), lowEffort: 0, highEffort: 0 }
        }

        const total = scores.reduce((sum, s) => sum + s.count, 0)
        if (total === 0) {
            return { total: 0, ces: 0, distribution: scores.map(s => ({ ...s, percent: 0 })), lowEffort: 0, highEffort: 0 }
        }

        // CES = Sum of (score × count) / total responses
        const weightedSum = scores.reduce((sum, s) => sum + (s.value * s.count), 0)
        const ces = weightedSum / total

        const distribution = scores.map(s => ({
            ...s,
            percent: (s.count / total) * 100
        }))

        // Low effort (1-3) and high effort (5-7)
        const lowEffort = (scores[0]!.count + scores[1]!.count + scores[2]!.count) / total * 100
        const highEffort = (scores[4]!.count + scores[5]!.count + scores[6]!.count) / total * 100

        return { total, ces, distribution, lowEffort, highEffort }
    }, [score1, score2, score3, score4, score5, score6, score7])

    const scoreInfo = getScoreLabel(metrics.ces)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>CES Calculator</h2>
                <p>
                    Calculate your Customer Effort Score (CES) to measure how easy it is for customers to interact with your product or service.
                </p>
                <p>
                    CES uses a 1-7 scale where 1 = Very Low Effort and 7 = Very High Effort. Lower scores are better.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Survey Responses</CardTitle>
                        <CardDescription>Enter responses for each effort level (1 = Very Easy, 7 = Very Difficult).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-7 gap-3">
                            {[
                                { label: "1 (Very Easy)", value: score1, setter: setScore1 },
                                { label: "2", value: score2, setter: setScore2 },
                                { label: "3", value: score3, setter: setScore3 },
                                { label: "4 (Neutral)", value: score4, setter: setScore4 },
                                { label: "5", value: score5, setter: setScore5 },
                                { label: "6", value: score6, setter: setScore6 },
                                { label: "7 (Very Hard)", value: score7, setter: setScore7 },
                            ].map((item, i) => (
                                <div key={i} className="space-y-1">
                                    <Label htmlFor={`score${i + 1}`} className="text-xs">{item.label}</Label>
                                    <Input
                                        id={`score${i + 1}`}
                                        type="number"
                                        min="0"
                                        value={item.value}
                                        onChange={(e) => item.setter(e.target.value)}
                                        className="text-center"
                                    />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Your CES Score</CardTitle>
                        <CardDescription>Average customer effort (lower is better).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className={`text-5xl font-bold ${scoreInfo.color}`}>{metrics.ces.toFixed(2)}</div>
                                <div className={`text-sm mt-1 ${scoreInfo.color}`}>{scoreInfo.label}</div>
                                <div className="text-xs text-accent mt-0.5">{scoreInfo.description}</div>
                            </div>
                            <div className="flex-1 max-w-xs">
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all duration-300"
                                        style={{ width: `${(metrics.ces / 7) * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-accent mt-1">
                                    <span>1 (Easy)</span>
                                    <span>7 (Hard)</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Effort Distribution</CardTitle>
                        <CardDescription>Breakdown by effort level.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Total Responses</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.total.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border border-green-200 dark:border-green-800 p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-green-600 dark:text-green-400">Low Effort (1-3)</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.lowEffort.toFixed(1)}%</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Neutral (4)</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.distribution[3]?.percent.toFixed(1) || 0}%
                                </div>
                            </div>
                            <div className="rounded-md border border-red-200 dark:border-red-800 p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-red-600 dark:text-red-400">High Effort (5-7)</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.highEffort.toFixed(1)}%</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Understanding CES</h3>
                <p>
                    Customer Effort Score measures friction in customer experiences. Research shows reducing effort is a stronger predictor of loyalty than increasing satisfaction.
                </p>

                <h4>CES Benchmarks</h4>
                <ul>
                    <li><strong>1-2</strong> — Excellent, effortless experience</li>
                    <li><strong>2-3</strong> — Good, easy interactions</li>
                    <li><strong>3-4</strong> — Fair, some friction present</li>
                    <li><strong>4+</strong> — Poor, frustrating experience</li>
                </ul>

                <h4>How to Reduce Effort</h4>
                <ul>
                    <li>Simplify processes and reduce steps.</li>
                    <li>Improve self-service options.</li>
                    <li>Reduce wait times and response delays.</li>
                    <li>Train staff to resolve issues on first contact.</li>
                </ul>
            </section>
        </div>
    )
}
