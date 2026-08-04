"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@featul/ui/components/select"

const BENCHMARKS: Record<string, { rate: number; label: string }> = {
    email: { rate: 25, label: "Email surveys" },
    inapp: { rate: 40, label: "In-app surveys" },
    sms: { rate: 35, label: "SMS surveys" },
    phone: { rate: 15, label: "Phone surveys" },
    web: { rate: 10, label: "Website pop-ups" },
    nps: { rate: 30, label: "NPS surveys" },
}

function getRateLabel(rate: number, benchmark: number): { label: string; color: string } {
    const ratio = rate / benchmark
    if (ratio >= 1.5) return { label: "Excellent", color: "text-green-600 dark:text-green-400" }
    if (ratio >= 1) return { label: "Good", color: "text-blue-600 dark:text-blue-400" }
    if (ratio >= 0.75) return { label: "Average", color: "text-yellow-600 dark:text-yellow-400" }
    if (ratio >= 0.5) return { label: "Below Average", color: "text-orange-600 dark:text-orange-400" }
    return { label: "Needs Improvement", color: "text-red-600 dark:text-red-400" }
}

export default function ResponseRateCalculatorTool() {
    const [sent, setSent] = useState<string>("1000")
    const [responses, setResponses] = useState<string>("280")
    const [surveyType, setSurveyType] = useState<string>("email")

    const metrics = useMemo(() => {
        const s = Number(sent)
        const r = Number(responses)

        if (!Number.isFinite(s) || !Number.isFinite(r) || s <= 0) {
            return { responseRate: 0, nonResponseRate: 0, benchmark: 25 }
        }

        const responseRate = (r / s) * 100
        const nonResponseRate = 100 - responseRate
        const benchmark = BENCHMARKS[surveyType]?.rate || 25

        return { responseRate, nonResponseRate, benchmark }
    }, [sent, responses, surveyType])

    const rateInfo = getRateLabel(metrics.responseRate, metrics.benchmark)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Response Rate Calculator</h2>
                <p>
                    Calculate your survey response rate and compare it against industry benchmarks to understand your survey performance.
                </p>
                <p>
                    Formula: <code>Response Rate = (Responses ÷ Surveys Sent) × 100%</code>
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Survey Data</CardTitle>
                        <CardDescription>Enter your survey distribution and response numbers.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="sent">Surveys Sent</Label>
                                <Input
                                    id="sent"
                                    type="number"
                                    min="1"
                                    value={sent}
                                    onChange={(e) => setSent(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="responses">Responses Received</Label>
                                <Input
                                    id="responses"
                                    type="number"
                                    min="0"
                                    value={responses}
                                    onChange={(e) => setResponses(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="type">Survey Type</Label>
                                <Select value={surveyType} onValueChange={setSurveyType}>
                                    <SelectTrigger id="type">
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(BENCHMARKS).map(([key, { label }]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Response Rate</CardTitle>
                        <CardDescription>Your survey performance vs benchmark.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className={`text-5xl font-bold ${rateInfo.color}`}>
                                    {metrics.responseRate.toFixed(1)}%
                                </div>
                                <div className={`text-sm mt-1 ${rateInfo.color}`}>{rateInfo.label}</div>
                            </div>
                            <div className="flex-1 max-w-xs">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-xs">
                                        <span className="text-accent">Your Rate</span>
                                        <span className="text-accent">Benchmark: {metrics.benchmark}%</span>
                                    </div>
                                    <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden relative">
                                        <div
                                            className="absolute h-full w-0.5 bg-primary z-10"
                                            style={{ left: `${Math.min(metrics.benchmark, 100)}%` }}
                                        />
                                        <div
                                            className={`h-full transition-all duration-300 ${metrics.responseRate >= metrics.benchmark ? "bg-green-500" : "bg-yellow-500"
                                                }`}
                                            style={{ width: `${Math.min(metrics.responseRate, 100)}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Breakdown</CardTitle>
                        <CardDescription>Response distribution details.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Surveys Sent</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {Number(sent).toLocaleString()}
                                </div>
                            </div>
                            <div className="rounded-md border border-green-200 dark:border-green-800 p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-green-600 dark:text-green-400">Responses</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {Number(responses).toLocaleString()}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Non-Responses</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {(Number(sent) - Number(responses)).toLocaleString()}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Non-Response Rate</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.nonResponseRate.toFixed(1)}%
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Industry Benchmarks</CardTitle>
                        <CardDescription>Average response rates by survey type.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.entries(BENCHMARKS).map(([key, { rate, label }]) => (
                                <div
                                    key={key}
                                    className={`rounded-md border p-2 text-center ${key === surveyType ? "border-primary bg-primary/5" : ""}`}
                                >
                                    <div className="text-xs text-accent">{label}</div>
                                    <div className="font-mono text-sm font-medium">{rate}%</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Improving Response Rates</h3>
                <p>
                    Higher response rates lead to more reliable data and better insights.
                </p>

                <h4>Tips to Boost Responses</h4>
                <ul>
                    <li><strong>Keep surveys short</strong> — 5 questions or less is ideal</li>
                    <li><strong>Send reminders</strong> — 2-3 follow-ups can double responses</li>
                    <li><strong>Optimize timing</strong> — Tuesdays and Wednesdays work best</li>
                    <li><strong>Personalize invites</strong> — Use names and relevant context</li>
                    <li><strong>Offer incentives</strong> — Even small rewards help</li>
                    <li><strong>Mobile-friendly</strong> — Many respond on mobile devices</li>
                </ul>
            </section>
        </div>
    )
}
