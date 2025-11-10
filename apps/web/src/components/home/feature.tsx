import { Container } from '../global/container'
import { Card } from '@feedgot/ui/components/card'
import { MeetingIllustration } from '@/components/home/illustrations/MeetingIllustration'
import { CodeReviewIllustration } from '@/components/home/illustrations/CodeReviewIllustration'
import { AIAssistantIllustration } from '@/components/home/illustrations/AIAssistantIllustration'

export default function FeaturesSection() {
    return (
        <Container maxWidth="6xl" className="px-4 sm:px-16 lg:px-20 xl:px-24">
        <section data-component="FeaturesSection">
            <div className="py-24">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
                    <h2 className="text-foreground text-balance text-3xl sm:text-4xl font-semibold">
                        <span className="text-muted-foreground">jean daly Marketing teams with</span> AI-driven solutions
                    </h2>
                    <div className="mt-12 grid gap-12 sm:grid-cols-2">
                        <div className="col-span-full space-y-4">
                            <Card
                                className="overflow-hidden px-6 sm:col-span-2">
                                <div className="mask-b-from-75% mx-auto mt-0 max-w-sm px-2 pt-8">
                                    <AIAssistantIllustration />
                                </div>
                            </Card>
                            <div className="max-w-md sm:col-span-3">
                                <h3 className="text-foreground text-lg font-semibold">Contextual AI Assistant</h3>
                                <p className="text-muted-foreground mt-3 text-balance">A personalized AI companion that understands your codebase and helps solve complex...</p>
                            </div>
                        </div>
                        <div className="grid grid-rows-[1fr_auto] space-y-4">
                            <Card className="p-6">
                                <MeetingIllustration />
                            </Card>
                            <div>
                                <h3 className="text-foreground text-lg font-semibold">AI Code Generation</h3>
                                <p className="text-muted-foreground mt-3 text-balance">Our advanced AI models transform natural language into production-ready code.</p>
                            </div>
                        </div>

                        <div className="grid grid-rows-[1fr_auto] space-y-4">
                            <Card className="overflow-hidden p-6">
                                <CodeReviewIllustration />
                            </Card>
                            <div>
                                <h3 className="text-foreground text-lg font-semibold">Intelligent Code Review</h3>
                                <p className="text-muted-foreground mt-3 text-balance">Our AI analyzes your code for bugs, security issues, and optimization opportunities.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
        </Container>
    )
}