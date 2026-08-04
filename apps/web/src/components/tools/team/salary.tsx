"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@featul/ui/components/select"

const HOURS_PER_WEEK = {
    "40": { label: "40 hours (Standard)", hours: 40 },
    "35": { label: "35 hours", hours: 35 },
    "37.5": { label: "37.5 hours", hours: 37.5 },
    "45": { label: "45 hours", hours: 45 },
    "50": { label: "50 hours", hours: 50 },
}

export default function SalaryCalculatorTool() {
    const [annual, setAnnual] = useState<string>("75000")
    const [hoursPerWeek, setHoursPerWeek] = useState<string>("40")
    const [weeksPerYear, setWeeksPerYear] = useState<string>("52")
    const [ptoWeeks, setPtoWeeks] = useState<string>("3")

    const metrics = useMemo(() => {
        const annualSalary = Number(annual)
        const weeklyHours = Number(hoursPerWeek)
        const weeksYear = Number(weeksPerYear)
        const pto = Number(ptoWeeks)

        if (![annualSalary, weeklyHours, weeksYear].every(n => Number.isFinite(n) && n > 0)) {
            return { hourly: 0, monthly: 0, biweekly: 0, weekly: 0, daily: 0, effectiveHourly: 0 }
        }

        const workedWeeks = weeksYear - pto
        const totalHours = weeksYear * weeklyHours
        const effectiveHours = workedWeeks * weeklyHours

        const hourly = annualSalary / totalHours
        const effectiveHourly = annualSalary / effectiveHours
        const monthly = annualSalary / 12
        const biweekly = annualSalary / 26
        const weekly = annualSalary / weeksYear
        const daily = weekly / 5

        return { hourly, monthly, biweekly, weekly, daily, effectiveHourly }
    }, [annual, hoursPerWeek, weeksPerYear, ptoWeeks])

    const formatCurrency = (n: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(n)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Salary Calculator</h2>
                <p>
                    Convert between annual salary and hourly rate. Calculate monthly, weekly, and daily equivalents with PTO adjustments.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Salary Details</CardTitle>
                        <CardDescription>Enter your salary information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="annual">Annual Salary ($)</Label>
                                <Input
                                    id="annual"
                                    type="number"
                                    min="0"
                                    value={annual}
                                    onChange={(e) => setAnnual(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="hours">Hours per Week</Label>
                                <Select value={hoursPerWeek} onValueChange={setHoursPerWeek}>
                                    <SelectTrigger id="hours">
                                        <SelectValue placeholder="Select hours" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(HOURS_PER_WEEK).map(([key, { label }]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weeks">Weeks per Year</Label>
                                <Input
                                    id="weeks"
                                    type="number"
                                    min="1"
                                    max="52"
                                    value={weeksPerYear}
                                    onChange={(e) => setWeeksPerYear(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="pto">PTO Weeks</Label>
                                <Input
                                    id="pto"
                                    type="number"
                                    min="0"
                                    max="12"
                                    value={ptoWeeks}
                                    onChange={(e) => setPtoWeeks(e.target.value)}
                                />
                                <p className="text-xs text-accent">Vacation + holidays</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Hourly Rate</CardTitle>
                        <CardDescription>Your salary broken down to hourly.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
                            <div className="rounded-md border-2 border-primary/50 p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">Standard Hourly</div>
                                <div className="mt-1 font-mono text-3xl font-bold leading-tight text-foreground">
                                    {formatCurrency(metrics.hourly)}
                                </div>
                                <div className="text-xs text-accent mt-1">per hour</div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[100px]">
                                <div className="text-xs text-accent">Effective Hourly</div>
                                <div className="mt-1 font-mono text-2xl leading-tight text-foreground">
                                    {formatCurrency(metrics.effectiveHourly)}
                                </div>
                                <div className="text-xs text-accent mt-1">accounting for PTO</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Pay Period Breakdown</CardTitle>
                        <CardDescription>Your salary across different periods.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Monthly</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(metrics.monthly)}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Bi-weekly</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(metrics.biweekly)}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Weekly</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(metrics.weekly)}
                                </div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Daily</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {formatCurrency(metrics.daily)}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Quick Reference</CardTitle>
                        <CardDescription>Common salary to hourly conversions (40 hrs/week).</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { salary: 50000, hourly: 24.04 },
                                { salary: 75000, hourly: 36.06 },
                                { salary: 100000, hourly: 48.08 },
                                { salary: 150000, hourly: 72.12 },
                            ].map((item) => (
                                <div key={item.salary} className="rounded-md border p-2 text-center">
                                    <div className="text-xs text-accent">${(item.salary / 1000).toFixed(0)}k/year</div>
                                    <div className="font-mono text-sm font-medium">${item.hourly.toFixed(2)}/hr</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Salary Conversion Formulas</h3>
                <p>
                    Understanding your effective hourly rate helps with budgeting and comparing job offers.
                </p>

                <h4>Standard Conversion</h4>
                <ul>
                    <li><strong>Hourly to Annual:</strong> Hourly × 2,080 (40 hrs × 52 weeks)</li>
                    <li><strong>Annual to Hourly:</strong> Annual ÷ 2,080</li>
                    <li><strong>Annual to Monthly:</strong> Annual ÷ 12</li>
                </ul>

                <h4>Things to Consider</h4>
                <ul>
                    <li>Benefits add 20-40% to total compensation</li>
                    <li>Contractors typically charge 1.5-2x hourly equivalent</li>
                    <li>Factor in commute time and costs</li>
                    <li>Remote work can save $4,000+ annually</li>
                </ul>
            </section>
        </div>
    )
}
