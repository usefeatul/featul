"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

export default function SprintVelocityCalculatorTool() {
    const [sprint1, setSprint1] = useState<string>("21")
    const [sprint2, setSprint2] = useState<string>("24")
    const [sprint3, setSprint3] = useState<string>("19")
    const [sprint4, setSprint4] = useState<string>("26")
    const [sprint5, setSprint5] = useState<string>("22")
    const [sprintLength, setSprintLength] = useState<string>("2")
    const [teamSize, setTeamSize] = useState<string>("5")

    const metrics = useMemo(() => {
        const sprints = [sprint1, sprint2, sprint3, sprint4, sprint5]
            .map(Number)
            .filter(n => Number.isFinite(n) && n > 0)

        const length = Number(sprintLength)
        const size = Number(teamSize)

        if (sprints.length === 0 || !Number.isFinite(length) || !Number.isFinite(size) || length <= 0 || size <= 0) {
            return {
                avgVelocity: 0, minVelocity: 0, maxVelocity: 0,
                stdDev: 0, velocityRange: { low: 0, likely: 0, high: 0 },
                pointsPerPerson: 0, sprintsPerQuarter: 0, quarterlyCapacity: 0
            }
        }

        const avgVelocity = sprints.reduce((a, b) => a + b, 0) / sprints.length
        const minVelocity = Math.min(...sprints)
        const maxVelocity = Math.max(...sprints)

        // Standard deviation
        const variance = sprints.reduce((sum, v) => sum + Math.pow(v - avgVelocity, 2), 0) / sprints.length
        const stdDev = Math.sqrt(variance)

        // Velocity range (pessimistic, likely, optimistic)
        const velocityRange = {
            low: Math.max(0, avgVelocity - stdDev),
            likely: avgVelocity,
            high: avgVelocity + stdDev
        }

        // Points per person per sprint
        const pointsPerPerson = avgVelocity / size

        // Sprints per quarter (13 weeks)
        const sprintsPerQuarter = Math.floor(13 / length)

        // Quarterly capacity
        const quarterlyCapacity = avgVelocity * sprintsPerQuarter

        return {
            avgVelocity, minVelocity, maxVelocity,
            stdDev, velocityRange,
            pointsPerPerson, sprintsPerQuarter, quarterlyCapacity
        }
    }, [sprint1, sprint2, sprint3, sprint4, sprint5, sprintLength, teamSize])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Sprint Velocity Calculator</h2>
                <p>
                    Calculate your team&apos;s average sprint velocity and predict future capacity for better sprint planning and roadmap estimation.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Historical Sprints</CardTitle>
                        <CardDescription>Enter completed story points from recent sprints.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            {[
                                { label: "Sprint 1", value: sprint1, setter: setSprint1 },
                                { label: "Sprint 2", value: sprint2, setter: setSprint2 },
                                { label: "Sprint 3", value: sprint3, setter: setSprint3 },
                                { label: "Sprint 4", value: sprint4, setter: setSprint4 },
                                { label: "Sprint 5", value: sprint5, setter: setSprint5 },
                            ].map((sprint, i) => (
                                <div key={i} className="space-y-1">
                                    <Label htmlFor={`sprint${i + 1}`}>{sprint.label}</Label>
                                    <Input
                                        id={`sprint${i + 1}`}
                                        type="number"
                                        min="0"
                                        value={sprint.value}
                                        onChange={(e) => sprint.setter(e.target.value)}
                                        placeholder="Points"
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4">
                            <div className="space-y-1">
                                <Label htmlFor="sprintLength">Sprint Length (weeks)</Label>
                                <Input
                                    id="sprintLength"
                                    type="number"
                                    min="1"
                                    value={sprintLength}
                                    onChange={(e) => setSprintLength(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="teamSize">Team Size</Label>
                                <Input
                                    id="teamSize"
                                    type="number"
                                    min="1"
                                    value={teamSize}
                                    onChange={(e) => setTeamSize(e.target.value)}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Velocity Analysis</CardTitle>
                        <CardDescription>Team&apos;s average performance and variability.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border-2 border-primary/50 p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Avg Velocity</div>
                                <div className="mt-1 font-mono text-2xl font-bold leading-tight text-foreground">
                                    {metrics.avgVelocity.toFixed(1)}
                                </div>
                                <div className="text-xs text-accent mt-0.5">points/sprint</div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Range</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    {metrics.minVelocity} - {metrics.maxVelocity}
                                </div>
                                <div className="text-xs text-accent mt-0.5">min - max</div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Std Deviation</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    ±{metrics.stdDev.toFixed(1)}
                                </div>
                                <div className="text-xs text-accent mt-0.5">variability</div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Per Person</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    {metrics.pointsPerPerson.toFixed(1)}
                                </div>
                                <div className="text-xs text-accent mt-0.5">points/sprint</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Capacity Planning</CardTitle>
                        <CardDescription>Projected future capacity based on velocity.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                            <div className="rounded-md border border-yellow-200 dark:border-yellow-800 p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-yellow-600 dark:text-yellow-400">Conservative</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    {metrics.velocityRange.low.toFixed(0)} pts
                                </div>
                                <div className="text-xs text-accent mt-0.5">next sprint</div>
                            </div>
                            <div className="rounded-md border border-green-200 dark:border-green-800 p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-green-600 dark:text-green-400">Likely</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    {metrics.velocityRange.likely.toFixed(0)} pts
                                </div>
                                <div className="text-xs text-accent mt-0.5">next sprint</div>
                            </div>
                            <div className="rounded-md border border-blue-200 dark:border-blue-800 p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-blue-600 dark:text-blue-400">Optimistic</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    {metrics.velocityRange.high.toFixed(0)} pts
                                </div>
                                <div className="text-xs text-accent mt-0.5">next sprint</div>
                            </div>
                        </div>
                        <div className="mt-4 p-4 rounded-md border bg-zinc-50 dark:bg-zinc-900">
                            <div className="text-center">
                                <div className="text-sm text-accent">Quarterly Capacity ({metrics.sprintsPerQuarter} sprints)</div>
                                <div className="mt-1 font-mono text-2xl font-bold text-foreground">
                                    ~{metrics.quarterlyCapacity.toFixed(0)} story points
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Understanding Velocity</h3>
                <p>
                    Sprint velocity measures how much work a team completes in a sprint, typically measured in story points. Use 3-5 sprints for a reliable average.
                </p>

                <h4>Using Velocity Effectively</h4>
                <ul>
                    <li><strong>Plan conservatively</strong> — Use the lower estimate for commitments.</li>
                    <li><strong>Don&apos;t compare teams</strong> — Story points are team-specific.</li>
                    <li><strong>Track trends</strong> — Stable or improving velocity indicates healthy teams.</li>
                    <li><strong>Account for vacations</strong> — Adjust capacity for time off.</li>
                </ul>

                <h4>Common Velocity Issues</h4>
                <ul>
                    <li>High variability often indicates scope creep or estimation problems.</li>
                    <li>Declining velocity may signal technical debt or team issues.</li>
                    <li>New team members temporarily reduce velocity during onboarding.</li>
                </ul>
            </section>
        </div>
    )
}
