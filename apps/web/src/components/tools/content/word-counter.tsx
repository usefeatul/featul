"use client"

import { useMemo, useState } from "react"
import BackLink from "@/components/tools/global/backlink"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@featul/ui/components/card"
import { Label } from "@featul/ui/components/label"
import { Textarea } from "@featul/ui/components/textarea"

export default function WordCounterTool() {
    const [text, setText] = useState<string>("Paste or type your text here to get a complete analysis including word count, character count, sentence count, and estimated reading time.")

    const metrics = useMemo(() => {
        const trimmed = text.trim()
        if (!trimmed) {
            return { words: 0, characters: 0, charactersNoSpaces: 0, sentences: 0, paragraphs: 0, readingTime: 0, speakingTime: 0 }
        }

        const words = trimmed.split(/\s+/).filter(Boolean).length
        const characters = text.length
        const charactersNoSpaces = text.replace(/\s/g, "").length
        const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0).length
        const paragraphs = trimmed.split(/\n\n+/).filter(p => p.trim().length > 0).length

        // Average reading speed: 200-250 words per minute
        const readingTime = Math.ceil(words / 225)
        // Average speaking speed: 125-150 words per minute
        const speakingTime = Math.ceil(words / 130)

        return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTime, speakingTime }
    }, [text])

    return (
        <div>
            <div className="prose prose-sm sm:prose-base prose-zinc dark:prose-invert mt-6 tracking-wide">
                <h2>Word Counter</h2>
                <p>
                    Count words, characters, sentences, and paragraphs in your text. Get estimated reading and speaking times for content planning.
                </p>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Your Text</CardTitle>
                        <CardDescription>Paste or type your content below.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="text" className="sr-only">Text to analyze</Label>
                            <Textarea
                                id="text"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={8}
                                placeholder="Start typing or paste your text here..."
                                className="font-mono text-sm"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="space-y-1 tracking-wide">
                        <CardTitle className="text-base">Statistics</CardTitle>
                        <CardDescription>Text analysis results.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Words</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.words.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Characters</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.characters.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Characters (no spaces)</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.charactersNoSpaces.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Sentences</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.sentences.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Paragraphs</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.paragraphs.toLocaleString()}</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Reading Time</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.readingTime} min</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Speaking Time</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">{metrics.speakingTime} min</div>
                            </div>
                            <div className="rounded-md border p-3 text-center flex flex-col items-center justify-center min-h-[72px]">
                                <div className="text-xs text-accent">Avg. Words/Sentence</div>
                                <div className="mt-1 font-mono text-base leading-tight text-foreground">
                                    {metrics.sentences > 0 ? (metrics.words / metrics.sentences).toFixed(1) : "0"}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <BackLink />
            </div>

            <section className="mt-8 prose prose-sm sm:prose-base prose-zinc dark:prose-invert">
                <h3>About Word Counter</h3>
                <p>
                    Use this free word counter to quickly analyze your content. Perfect for meeting word count requirements, optimizing content length, or planning presentation times.
                </p>

                <h4>How to use</h4>
                <ol>
                    <li>Paste or type your text in the input area.</li>
                    <li>View real-time statistics as you type.</li>
                    <li>Use reading/speaking time for content planning.</li>
                </ol>

                <h4>Tips</h4>
                <ul>
                    <li>Ideal blog posts are typically 1,500-2,500 words for SEO.</li>
                    <li>Keep sentences under 20 words for better readability.</li>
                    <li>Plan 1 minute of speaking time per 130 words.</li>
                </ul>
            </section>
        </div>
    )
}
