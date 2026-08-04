"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Textarea } from "@featul/ui/components/textarea"

function countSyllables(word: string): number {
    word = word.toLowerCase().replace(/[^a-z]/g, "")
    if (word.length <= 3) return 1

    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    word = word.replace(/^y/, "")
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? matches.length : 1
}

function getGradeLabel(grade: number): string {
    if (grade < 1) return "Kindergarten"
    if (grade <= 5) return `${Math.round(grade)}th Grade (Elementary)`
    if (grade <= 8) return `${Math.round(grade)}th Grade (Middle School)`
    if (grade <= 12) return `${Math.round(grade)}th Grade (High School)`
    if (grade <= 16) return "College Level"
    return "Graduate Level"
}

function getEaseLabel(score: number): { label: string; description: string } {
    if (score >= 90) return { label: "Very Easy", description: "Easily understood by 11-year-olds" }
    if (score >= 80) return { label: "Easy", description: "Conversational English" }
    if (score >= 70) return { label: "Fairly Easy", description: "7th grade level" }
    if (score >= 60) return { label: "Standard", description: "8th-9th grade level" }
    if (score >= 50) return { label: "Fairly Difficult", description: "10th-12th grade level" }
    if (score >= 30) return { label: "Difficult", description: "College level" }
    return { label: "Very Difficult", description: "Graduate level, professional" }
}

export default function ReadabilityScoreTool() {
    const [text, setText] = useState<string>("The quick brown fox jumps over the lazy dog. This is a simple sentence that demonstrates basic readability. Most people can easily understand this type of writing without any difficulty.")

    const metrics = useMemo(() => {
        const trimmed = text.trim()
        if (!trimmed) {
            return {
                words: 0, sentences: 0, syllables: 0,
                fleschEase: 0, fleschGrade: 0,
                gunningFog: 0, smog: 0,
                avgWordsPerSentence: 0, avgSyllablesPerWord: 0
            }
        }

        const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0)
        const words = trimmed.split(/\s+/).filter(Boolean)
        const syllables = words.reduce((sum, word) => sum + countSyllables(word), 0)
        const complexWords = words.filter(w => countSyllables(w) >= 3).length

        const sentenceCount = Math.max(sentences.length, 1)
        const wordCount = words.length
        const syllableCount = syllables

        const avgWordsPerSentence = wordCount / sentenceCount
        const avgSyllablesPerWord = syllableCount / Math.max(wordCount, 1)

        // Flesch Reading Ease: 206.835 - 1.015(words/sentences) - 84.6(syllables/words)
        const fleschEase = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)

        // Flesch-Kincaid Grade Level: 0.39(words/sentences) + 11.8(syllables/words) - 15.59
        const fleschGrade = (0.39 * avgWordsPerSentence) + (11.8 * avgSyllablesPerWord) - 15.59

        // Gunning Fog Index: 0.4 * (avgWordsPerSentence + 100 * (complexWords/wordCount))
        const gunningFog = 0.4 * (avgWordsPerSentence + 100 * (complexWords / Math.max(wordCount, 1)))

        // SMOG Index: 1.0430 * sqrt(complexWords * (30/sentences)) + 3.1291
        const smog = 1.0430 * Math.sqrt(complexWords * (30 / sentenceCount)) + 3.1291

        return {
            words: wordCount,
            sentences: sentenceCount,
            syllables: syllableCount,
            fleschEase: Math.max(0, Math.min(100, fleschEase)),
            fleschGrade: Math.max(0, fleschGrade),
            gunningFog: Math.max(0, gunningFog),
            smog: Math.max(0, smog),
            avgWordsPerSentence,
            avgSyllablesPerWord
        }
    }, [text])

    const easeInfo = getEaseLabel(metrics.fleschEase)

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Readability Score Calculator</h2>
                <p>
                    Calculate Flesch Reading Ease, Flesch-Kincaid Grade Level, Gunning Fog Index, and SMOG Index to measure how easy your content is to read.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Your Text</CardTitle>
                        <CardDescription>Paste or type content to analyze its readability.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="text" className="sr-only">Text to analyze</Label>
                            <Textarea
                                id="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={6}
                                placeholder="Paste your text here to analyze readability..."
                                className="font-mono text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Readability Scores</CardTitle>
                        <CardDescription>Multiple formulas for comprehensive analysis.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Flesch Ease</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">{metrics.fleschEase.toFixed(1)}</div>
                                <div className="mt-0.5 text-xs text-accent">{easeInfo.label}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Flesch-Kincaid Grade</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">{metrics.fleschGrade.toFixed(1)}</div>
                                <div className="mt-0.5 text-xs text-accent">{getGradeLabel(metrics.fleschGrade)}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">Gunning Fog</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">{metrics.gunningFog.toFixed(1)}</div>
                                <div className="mt-0.5 text-xs text-accent">{getGradeLabel(metrics.gunningFog)}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[88px]">
                                <div className="text-xs text-accent">SMOG Index</div>
                                <div className="mt-1 font-mono text-lg leading-tight text-foreground">{metrics.smog.toFixed(1)}</div>
                                <div className="mt-0.5 text-xs text-accent">{getGradeLabel(metrics.smog)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Text Statistics</CardTitle>
                        <CardDescription>Detailed breakdown of your text.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Words</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.words}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Sentences</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.sentences}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Syllables</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.syllables}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Words/Sentence</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.avgWordsPerSentence.toFixed(1)}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Syllables/Word</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.avgSyllablesPerWord.toFixed(2)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>Understanding Readability Scores</h3>
                <p>
                    Readability formulas estimate how easy text is to understand based on sentence length and word complexity.
                </p>

                <h4>Flesch Reading Ease (0-100)</h4>
                <p>Higher scores = easier to read. Aim for 60-70 for general audiences.</p>

                <h4>Flesch-Kincaid Grade Level</h4>
                <p>Indicates U.S. school grade level needed to understand the text. Most content should target 7-9.</p>

                <h4>Tips for Better Readability</h4>
                <ul>
                    <li>Use shorter sentences (15-20 words average).</li>
                    <li>Choose simpler words when possible.</li>
                    <li>Break complex ideas into multiple sentences.</li>
                    <li>Use active voice instead of passive.</li>
                </ul>
            </section>
        </div>
    )
}
