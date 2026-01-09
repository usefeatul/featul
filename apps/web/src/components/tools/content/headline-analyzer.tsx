"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Input } from "@featul/ui/components/input"

const POWER_WORDS = new Set([
    "free", "new", "proven", "secret", "instant", "guaranteed", "discover", "amazing",
    "exclusive", "breakthrough", "revolutionary", "ultimate", "powerful", "essential",
    "easy", "quick", "fast", "simple", "complete", "best", "top", "first", "last"
])

const EMOTIONAL_WORDS = new Set([
    "love", "fear", "hate", "worry", "happy", "sad", "angry", "excited", "surprised",
    "shocked", "terrified", "thrilled", "devastating", "heartbreaking", "inspiring",
    "beautiful", "ugly", "wonderful", "terrible", "amazing", "awful", "incredible"
])

const COMMON_WORDS = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being", "have", "has",
    "had", "do", "does", "did", "will", "would", "could", "should", "may", "might",
    "must", "shall", "can", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below", "between",
    "and", "but", "or", "nor", "so", "yet", "both", "either", "neither", "not", "only",
    "own", "same", "than", "too", "very", "just", "it", "its", "you", "your", "we", "our"
])

function getScoreLabel(score: number): { label: string; color: string } {
    if (score >= 80) return { label: "Excellent", color: "text-green-600 dark:text-green-400" }
    if (score >= 60) return { label: "Good", color: "text-blue-600 dark:text-blue-400" }
    if (score >= 40) return { label: "Average", color: "text-yellow-600 dark:text-yellow-400" }
    if (score >= 20) return { label: "Needs Work", color: "text-orange-600 dark:text-orange-400" }
    return { label: "Poor", color: "text-red-600 dark:text-red-400" }
}

export default function HeadlineAnalyzerTool() {
    const [headline, setHeadline] = useState<string>("10 Proven Ways to Boost Your Productivity Today")

    const analysis = useMemo(() => {
        const trimmed = headline.trim()
        if (!trimmed) {
            return {
                score: 0, words: [], wordCount: 0, charCount: 0,
                commonPercent: 0, uncommonPercent: 0, emotionalPercent: 0, powerPercent: 0,
                hasNumber: false, sentiment: "neutral", lengthScore: 0
            }
        }

        const words = trimmed.split(/\s+/).filter(Boolean)
        const wordCount = words.length
        const charCount = trimmed.length

        let commonCount = 0
        let powerCount = 0
        let emotionalCount = 0

        words.forEach(word => {
            const lower = word.toLowerCase().replace(/[^a-z]/g, "")
            if (COMMON_WORDS.has(lower)) commonCount++
            if (POWER_WORDS.has(lower)) powerCount++
            if (EMOTIONAL_WORDS.has(lower)) emotionalCount++
        })

        const uncommonCount = wordCount - commonCount

        const commonPercent = (commonCount / wordCount) * 100
        const uncommonPercent = (uncommonCount / wordCount) * 100
        const emotionalPercent = (emotionalCount / wordCount) * 100
        const powerPercent = (powerCount / wordCount) * 100

        // Check for numbers
        const hasNumber = /\d/.test(trimmed)

        // Calculate length score (optimal: 6-12 words, 50-70 characters)
        let lengthScore = 0
        if (wordCount >= 6 && wordCount <= 12) lengthScore += 25
        else if (wordCount >= 4 && wordCount <= 14) lengthScore += 15
        else lengthScore += 5

        if (charCount >= 50 && charCount <= 70) lengthScore += 25
        else if (charCount >= 40 && charCount <= 80) lengthScore += 15
        else lengthScore += 5

        // Calculate overall score
        let score = lengthScore

        // Word balance (ideal: 20-30% common, 10-20% uncommon, some power/emotional)
        if (commonPercent >= 20 && commonPercent <= 40) score += 15
        else if (commonPercent >= 10 && commonPercent <= 50) score += 10

        if (uncommonPercent >= 20 && uncommonPercent <= 40) score += 15
        else if (uncommonPercent >= 10 && uncommonPercent <= 50) score += 10

        if (powerPercent > 0) score += Math.min(powerPercent * 2, 15)
        if (emotionalPercent > 0) score += Math.min(emotionalPercent * 2, 15)
        if (hasNumber) score += 10

        // Cap at 100
        score = Math.min(100, Math.max(0, score))

        return {
            score, words, wordCount, charCount,
            commonPercent, uncommonPercent, emotionalPercent, powerPercent,
            hasNumber, lengthScore
        }
    }, [headline])

    const scoreInfo = getScoreLabel(analysis.score)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Headline Analyzer</h2>
                <p>
                    Score your headlines for engagement potential. Analyze word balance, length, and emotional impact to write headlines that get clicks.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Your Headline</CardTitle>
                        <CardDescription>Enter a headline or title to analyze.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="headline" className="sr-only">Headline</Label>
                            <Input
                                id="headline"
                                value={headline}
                                onChange={(e) => setHeadline(e.target.value)}
                                placeholder="Enter your headline here..."
                                className="text-lg"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Overall Score</CardTitle>
                        <CardDescription>How effective is your headline?</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                                <div className={`text-5xl font-bold ${scoreInfo.color}`}>{Math.round(analysis.score)}</div>
                                <div className={`text-sm mt-1 ${scoreInfo.color}`}>{scoreInfo.label}</div>
                            </div>
                            <div className="flex-1 max-w-xs">
                                <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-300"
                                        style={{ width: `${analysis.score}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Word Balance</CardTitle>
                        <CardDescription>Distribution of word types in your headline.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Common Words</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{analysis.commonPercent.toFixed(0)}%</div>
                                <div className="mt-0.5 text-xs text-accent">Ideal: 20-30%</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Uncommon Words</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{analysis.uncommonPercent.toFixed(0)}%</div>
                                <div className="mt-0.5 text-xs text-accent">Ideal: 10-20%</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Power Words</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{analysis.powerPercent.toFixed(0)}%</div>
                                <div className="mt-0.5 text-xs text-accent">More = Better</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Emotional Words</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{analysis.emotionalPercent.toFixed(0)}%</div>
                                <div className="mt-0.5 text-xs text-accent">More = Better</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Length Analysis</CardTitle>
                        <CardDescription>Character and word count optimization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Word Count</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{analysis.wordCount}</div>
                                <div className="mt-0.5 text-xs text-accent">Ideal: 6-12</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Character Count</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{analysis.charCount}</div>
                                <div className="mt-0.5 text-xs text-accent">Ideal: 50-70</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Has Number?</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{analysis.hasNumber ? "Yes ✓" : "No"}</div>
                                <div className="mt-0.5 text-xs text-accent">Numbers boost CTR</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Writing Better Headlines</h3>
                <p>
                    Great headlines balance clarity with curiosity. They promise value while creating urgency.
                </p>

                <h4>Tips for High-Scoring Headlines</h4>
                <ul>
                    <li>Include numbers (listicles perform 36% better).</li>
                    <li>Use power words like "proven", "secret", "essential".</li>
                    <li>Keep length between 6-12 words.</li>
                    <li>Add emotional triggers for engagement.</li>
                    <li>Be specific—vague headlines get ignored.</li>
                </ul>

                <h4>Power Words to Try</h4>
                <p>Free, Proven, Secret, Instant, Guaranteed, Discover, Amazing, Exclusive, Ultimate, Essential</p>
            </section>
        </div>
    )
}
