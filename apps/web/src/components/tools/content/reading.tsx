"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Textarea } from "@featul/ui/components/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@featul/ui/components/select"

const READING_SPEEDS = {
    slow: { wpm: 150, label: "Slow (150 wpm)" },
    average: { wpm: 225, label: "Average (225 wpm)" },
    fast: { wpm: 300, label: "Fast (300 wpm)" },
}

const CONTENT_TYPES = {
    casual: { multiplier: 1, label: "Casual (blog, articles)" },
    technical: { multiplier: 1.25, label: "Technical (documentation)" },
    academic: { multiplier: 1.5, label: "Academic (research)" },
    legal: { multiplier: 1.75, label: "Legal (contracts)" },
}

export default function ReadingTimeCalculatorTool() {
    const [text, setText] = useState<string>("Paste your content here to calculate how long it will take to read. This tool accounts for different reading speeds and content complexity to give you accurate time estimates for your audience.")
    const [speed, setSpeed] = useState<string>("average")
    const [contentType, setContentType] = useState<string>("casual")

    const metrics = useMemo(() => {
        const trimmed = text.trim()
        if (!trimmed) {
            return { words: 0, slowTime: 0, avgTime: 0, fastTime: 0, adjustedTime: 0 }
        }

        const words = trimmed.split(/\s+/).filter(Boolean).length
        const multiplier = CONTENT_TYPES[contentType as keyof typeof CONTENT_TYPES]?.multiplier || 1
        const baseWpm = READING_SPEEDS[speed as keyof typeof READING_SPEEDS]?.wpm || 225

        const slowTime = (words / READING_SPEEDS.slow.wpm) * multiplier
        const avgTime = (words / READING_SPEEDS.average.wpm) * multiplier
        const fastTime = (words / READING_SPEEDS.fast.wpm) * multiplier
        const adjustedTime = (words / baseWpm) * multiplier

        return { words, slowTime, avgTime, fastTime, adjustedTime }
    }, [text, speed, contentType])

    const formatTime = (minutes: number) => {
        if (minutes < 1) return `${Math.ceil(minutes * 60)} sec`
        if (minutes < 60) return `${Math.ceil(minutes)} min`
        const hrs = Math.floor(minutes / 60)
        const mins = Math.ceil(minutes % 60)
        return `${hrs}h ${mins}m`
    }

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Reading Time Calculator</h2>
                <p>
                    Calculate how long it takes to read your content based on word count, reading speed, and content complexity.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Your Content</CardTitle>
                        <CardDescription>Paste your text to calculate reading time.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="speed">Reading Speed</Label>
                                    <Select value={speed} onValueChange={setSpeed}>
                                        <SelectTrigger id="speed">
                                            <SelectValue placeholder="Select speed" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(READING_SPEEDS).map(([key, { label }]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="type">Content Type</Label>
                                    <Select value={contentType} onValueChange={setContentType}>
                                        <SelectTrigger id="type">
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(CONTENT_TYPES).map(([key, { label }]) => (
                                                <SelectItem key={key} value={key}>{label}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="text" className="sr-only">Content</Label>
                                <Textarea
                                    id="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    rows={6}
                                    placeholder="Paste your content here..."
                                    className="font-mono text-sm"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Reading Time</CardTitle>
                        <CardDescription>Estimated time to read your content.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border-2 border-primary/50 p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Your Selection</div>
                                <div className="mt-1 font-mono text-2xl font-bold leading-tight text-foreground">
                                    {formatTime(metrics.adjustedTime)}
                                </div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Slow Reader</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    {formatTime(metrics.slowTime)}
                                </div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Average Reader</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    {formatTime(metrics.avgTime)}
                                </div>
                            </div>
                            <div className="rounded-md border p-4 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Fast Reader</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">
                                    {formatTime(metrics.fastTime)}
                                </div>
                            </div>
                        </div>
                        <div className="mt-4 p-3 rounded-md border bg-zinc-50 dark:bg-zinc-900 text-center">
                            <span className="text-sm text-accent">Word Count: </span>
                            <span className="font-mono font-medium">{metrics.words.toLocaleString()} words</span>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>About Reading Time</h3>
                <p>
                    Average adults read 200-250 words per minute, but this varies with content complexity and individual reading habits.
                </p>

                <h4>Reading Speed Benchmarks</h4>
                <ul>
                    <li><strong>Slow:</strong> 150 wpm — Careful reading, complex material</li>
                    <li><strong>Average:</strong> 225 wpm — Normal reading pace</li>
                    <li><strong>Fast:</strong> 300 wpm — Skimming or familiar content</li>
                </ul>

                <h4>Content Complexity</h4>
                <ul>
                    <li>Technical and academic content takes 25-75% longer to read.</li>
                    <li>Legal and scientific text may require re-reading.</li>
                    <li>Use estimated times for blog posts and article planning.</li>
                </ul>
            </section>
        </div>
    )
}
