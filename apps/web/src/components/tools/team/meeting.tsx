"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

export default function MeetingCostCalculatorTool() {
    const [attendees, setAttendees] = useState<string>("6")
    const [duration, setDuration] = useState<string>("60")
    const [avgSalary, setAvgSalary] = useState<string>("75000")
    const [meetingsPerWeek, setMeetingsPerWeek] = useState<string>("3")

    const metrics = useMemo(() => {
        const numAttendees = Number(attendees)
        const durationMins = Number(duration)
        const salary = Number(avgSalary)
        const weeklyMeetings = Number(meetingsPerWeek)

        if (![numAttendees, durationMins, salary, weeklyMeetings].every(n => Number.isFinite(n) && n >= 0)) {
            return { meetingCost: 0, hourlyRate: 0, annualCost: 0, weeklyCost: 0, productiveHoursLost: 0 }
        }

        // Assuming 2080 working hours per year (40 hrs × 52 weeks)
        const hourlyRate = salary / 2080
        const durationHours = durationMins / 60

        // Cost per meeting = attendees × duration in hours × hourly rate
        const meetingCost = numAttendees * durationHours * hourlyRate

        // Weekly cost
        const weeklyCost = meetingCost * weeklyMeetings

        // Annual cost (52 weeks)
        const annualCost = weeklyCost * 52

        // Productive hours lost per year
        const productiveHoursLost = numAttendees * durationHours * weeklyMeetings * 52

        return { meetingCost, hourlyRate, annualCost, weeklyCost, productiveHoursLost }
    }, [attendees, duration, avgSalary, meetingsPerWeek])

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Meeting Cost Calculator</h2>
                <p>
                    Calculate the true cost of meetings based on attendee salaries and time spent. Understand the financial impact of your meeting culture.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Meeting Details</CardTitle>
                        <CardDescription>Enter your typical meeting parameters.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="attendees">Number of Attendees</Label>
                                <Input
                                    id="attendees"
                                    type="number"
                                    min="1"
                                    value={attendees}
                                    onChange={(e) => setAttendees(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="duration">Duration (minutes)</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="salary">Average Annual Salary ($)</Label>
                                <Input
                                    id="salary"
                                    type="number"
                                    min="0"
                                    value={avgSalary}
                                    onChange={(e) => setAvgSalary(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weekly">Meetings per Week</Label>
                                <Input
                                    id="weekly"
                                    type="number"
                                    min="0"
                                    value={meetingsPerWeek}
                                    onChange={(e) => setMeetingsPerWeek(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Cost Analysis</CardTitle>
                        <CardDescription>Financial impact of your meetings.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                            <div className="rounded-md border-2 border-primary/50 p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">Cost per Meeting</div>
                                <div className="mt-1 font-mono text-2xl font-bold leading-tight text-foreground">
                                    {formatCurrency(metrics.meetingCost)}
                                </div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">Weekly Cost</div>
                                <div className="mt-1 font-mono text-xl leading-tight text-foreground">
                                    {formatCurrency(metrics.weeklyCost)}
                                </div>
                            </div>
                            <div className="rounded-md border border-red-200 dark:border-red-800 p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-red-600 dark:text-red-400">Annual Cost</div>
                                <div className="mt-1 font-mono text-xl leading-tight text-red-600 dark:text-red-400">
                                    {formatCurrency(metrics.annualCost)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Productivity Impact</CardTitle>
                        <CardDescription>Time and opportunity cost.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Hourly Rate</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(metrics.hourlyRate)}/hr
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Person-Hours/Year</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.productiveHoursLost.toLocaleString()}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">FTE Equivalent</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {(metrics.productiveHoursLost / 2080).toFixed(1)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>The True Cost of Meetings</h3>
                <p>
                    Meetings consume significant time and money. Understanding their true cost helps teams make better decisions about when to meet.
                </p>

                <h4>Tips to Reduce Meeting Costs</h4>
                <ul>
                    <li><strong>Invite fewer people</strong> — Only include essential attendees.</li>
                    <li><strong>Shorten duration</strong> — Default to 25 or 50 minutes instead of 30 or 60.</li>
                    <li><strong>Cancel if no agenda</strong> — No agenda = no meeting.</li>
                    <li><strong>Use async alternatives</strong> — Slack, Loom, or documents for updates.</li>
                    <li><strong>Have meeting-free days</strong> — Block focused work time.</li>
                </ul>

                <h4>Meeting Efficiency Benchmarks</h4>
                <ul>
                    <li>Ideal meeting: 15-30 minutes, 2-5 attendees, clear agenda.</li>
                    <li>Senior employees spend ~23 hours/week in meetings on average.</li>
                    <li>71% of meetings are considered unproductive.</li>
                </ul>
            </section>
        </div>
    )
}
