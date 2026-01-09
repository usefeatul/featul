"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@featul/ui/components/select"

const RISK_BUFFERS = {
    low: { multiplier: 1.1, label: "Low Risk (10%)" },
    medium: { multiplier: 1.25, label: "Medium Risk (25%)" },
    high: { multiplier: 1.5, label: "High Risk (50%)" },
    very_high: { multiplier: 2, label: "Very High (100%)" },
}

function addBusinessDays(date: Date, days: number): Date {
    const result = new Date(date)
    let addedDays = 0
    while (addedDays < days) {
        result.setDate(result.getDate() + 1)
        const dayOfWeek = result.getDay()
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            addedDays++
        }
    }
    return result
}

function formatDate(date: Date): string {
    return date.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric"
    })
}

export default function ProjectTimelineEstimatorTool() {
    const [totalPoints, setTotalPoints] = useState<string>("100")
    const [velocity, setVelocity] = useState<string>("20")
    const [sprintLength, setSprintLength] = useState<string>("2")
    const [riskLevel, setRiskLevel] = useState<string>("medium")
    const [startDate, setStartDate] = useState<string>(new Date().toISOString().split("T")[0] ?? "")

    const metrics = useMemo(() => {
        const points = Number(totalPoints)
        const vel = Number(velocity)
        const sprintWeeks = Number(sprintLength)
        const buffer = RISK_BUFFERS[riskLevel as keyof typeof RISK_BUFFERS]?.multiplier || 1.25

        if (![points, vel, sprintWeeks].every(n => Number.isFinite(n) && n > 0)) {
            return {
                sprints: 0, weeks: 0, bufferedWeeks: 0,
                baseDate: new Date(), bufferedDate: new Date(),
                businessDays: 0, bufferedBusinessDays: 0
            }
        }

        const sprints = Math.ceil(points / vel)
        const weeks = sprints * sprintWeeks
        const bufferedWeeks = Math.ceil(weeks * buffer)

        const businessDays = weeks * 5
        const bufferedBusinessDays = bufferedWeeks * 5

        const start = new Date(startDate)
        const baseDate = addBusinessDays(start, businessDays)
        const bufferedDate = addBusinessDays(start, bufferedBusinessDays)

        return { sprints, weeks, bufferedWeeks, baseDate, bufferedDate, businessDays, bufferedBusinessDays }
    }, [totalPoints, velocity, sprintLength, riskLevel, startDate])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Project Timeline Estimator</h2>
                <p>
                    Estimate project completion dates based on scope, team velocity, and risk buffers for more realistic planning.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Project Parameters</CardTitle>
                        <CardDescription>Enter your project scope and team capacity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="points">Total Story Points</Label>
                                <Input
                                    id="points"
                                    type="number"
                                    min="1"
                                    value={totalPoints}
                                    onChange={(e) => setTotalPoints(e.target.value)}
                                />
                                <p className="text-xs text-accent">Total scope of work</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="velocity">Sprint Velocity</Label>
                                <Input
                                    id="velocity"
                                    type="number"
                                    min="1"
                                    value={velocity}
                                    onChange={(e) => setVelocity(e.target.value)}
                                />
                                <p className="text-xs text-accent">Points completed per sprint</p>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="sprint">Sprint Length (weeks)</Label>
                                <Select value={sprintLength} onValueChange={setSprintLength}>
                                    <SelectTrigger id="sprint">
                                        <SelectValue placeholder="Select length" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="1">1 week</SelectItem>
                                        <SelectItem value="2">2 weeks (Standard)</SelectItem>
                                        <SelectItem value="3">3 weeks</SelectItem>
                                        <SelectItem value="4">4 weeks</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="risk">Risk Buffer</Label>
                                <Select value={riskLevel} onValueChange={setRiskLevel}>
                                    <SelectTrigger id="risk">
                                        <SelectValue placeholder="Select risk" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(RISK_BUFFERS).map(([key, { label }]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="start">Start Date</Label>
                                <Input
                                    id="start"
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Estimated Completion</CardTitle>
                        <CardDescription>Projected end dates with and without buffer.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">Base Estimate</div>
                                <div className="mt-1 font-mono text-lg font-bold leading-tight text-foreground">
                                    {formatDate(metrics.baseDate)}
                                </div>
                                <div className="text-xs text-accent mt-1">{metrics.weeks} weeks</div>
                            </div>
                            <div className="rounded-md border-2 border-primary/50 p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">With Buffer</div>
                                <div className="mt-1 font-mono text-lg font-bold leading-tight text-foreground">
                                    {formatDate(metrics.bufferedDate)}
                                </div>
                                <div className="text-xs text-accent mt-1">{metrics.bufferedWeeks} weeks</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Timeline Breakdown</CardTitle>
                        <CardDescription>Detailed project schedule.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Sprints Needed</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.sprints}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Base Weeks</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.weeks}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Buffered Weeks</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.bufferedWeeks}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Business Days</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.bufferedBusinessDays}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Risk Buffer Guide</CardTitle>
                        <CardDescription>When to use each buffer level.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="rounded-md border p-3">
                                <div className="font-medium text-sm">Low (10%)</div>
                                <p className="text-xs text-accent mt-1">Stable team, well-defined scope, familiar tech</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="font-medium text-sm">Medium (25%)</div>
                                <p className="text-xs text-accent mt-1">Normal projects, some unknowns expected</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="font-medium text-sm">High (50%)</div>
                                <p className="text-xs text-accent mt-1">New tech, complex integrations, external dependencies</p>
                            </div>
                            <div className="rounded-md border p-3">
                                <div className="font-medium text-sm">Very High (100%)</div>
                                <p className="text-xs text-accent mt-1">R&D, new team, vague requirements</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Project Estimation Tips</h3>
                <p>
                    Accurate estimates require realistic velocity data and appropriate risk buffers.
                </p>

                <h4>Best Practices</h4>
                <ul>
                    <li><strong>Use historical velocity</strong> — Average of last 3-5 sprints</li>
                    <li><strong>Add buffer for unknowns</strong> — 25-50% is reasonable</li>
                    <li><strong>Account for meetings</strong> — Real coding time is less than you think</li>
                    <li><strong>Plan for holidays</strong> — Check your calendar for time off</li>
                </ul>

                <h4>Common Estimation Mistakes</h4>
                <ul>
                    <li>Using ideal velocity instead of actual</li>
                    <li>Not accounting for code review and testing</li>
                    <li>Ignoring external dependencies</li>
                    <li>Underestimating integration complexity</li>
                </ul>
            </section>
        </div>
    )
}
