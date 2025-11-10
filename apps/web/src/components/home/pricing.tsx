import { Button } from '@feedgot/ui/components/button'
import { Check } from 'lucide-react'
import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardDescription } from '@feedgot/ui/components/card'

export default function Pricing() {
    return (
        <div className="bg-background relative py-12 sm:py-16 md:py-24" data-component="Pricing">
            <div className="mx-auto max-w-6xl px-4 sm:px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl sm:text-4xl lg:text-5xl font-bold">Pricing that scale with your business</h2>
                    <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-balance text-base sm:text-lg">Choose the perfect plan for your needs and start optimizing your workflow today</p>
                </div>
                <div className="@container relative mt-12 md:mt-20">
                    <Card className="relative mx-auto max-w-full">
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <CardHeader className="p-6 sm:p-8">
                                    <CardTitle className="font-medium">Free</CardTitle>
                                    <span className="mb-0.5 mt-2 block text-2xl sm:text-3xl font-semibold">$0 / mo</span>
                                    <CardDescription className="text-sm">Per editor</CardDescription>
                                </CardHeader>
                                <div className="border-y px-6 sm:px-8 py-4">
                                    <Button
                                        asChild
                                        className="w-full"
                                        variant="outline">
                                        <Link href="#">Get Started</Link>
                                    </Button>
                                </div>

                                <ul
                                    role="list"
                                    className="space-y-3 p-6 sm:p-8">
                                    {['Basic Analytics Dashboard', '5GB Cloud Storage', 'Email and Chat Support'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check
                                                className="text-primary size-3"
                                                strokeWidth={3.5}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="ring-foreground/10 bg-background rounded-(--radius) @3xl:mx-0 @3xl:-my-3 -mx-1 border-transparent shadow ring-1">
                                <div className="@3xl:py-3 @3xl:px-0 relative px-1">
                                    <CardHeader className="p-6 sm:p-8">
                                        <CardTitle className="font-medium">Pro</CardTitle>
                                        <span className="mb-0.5 mt-2 block text-2xl sm:text-3xl font-semibold">$19 / mo</span>
                                        <CardDescription className="text-sm">Per editor</CardDescription>
                                    </CardHeader>
                                    <div className="@3xl:mx-0 -mx-1 border-y px-6 sm:px-8 py-4">
                                        <Button
                                            asChild
                                            className="w-full">
                                            <Link href="#">Get Started</Link>
                                        </Button>
                                    </div>

                                    <ul
                                        role="list"
                                        className="space-y-3 p-6 sm:p-8">
                                        {['Everything in Free Plan', '5GB Cloud Storage', 'Email and Chat Support', 'Access to Community Forum', 'Single User Access', 'Access to Basic Templates', 'Mobile App Access', '1 Custom Report Per Month', 'Monthly Product Updates', 'Standard Security Features'].map((item, index) => (
                                            <li
                                                key={index}
                                                className="flex items-center gap-2">
                                                <Check
                                                    className="text-primary size-3"
                                                    strokeWidth={3.5}
                                                />
                                                {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                            <div>
                                <CardHeader className="p-6 sm:p-8">
                                    <CardTitle className="font-medium">Pro Plus</CardTitle>
                                    <span className="mb-0.5 mt-2 block text-2xl sm:text-3xl font-semibold">$49 / mo</span>
                                    <CardDescription className="text-sm">Per editor</CardDescription>
                                </CardHeader>
                                <div className="border-y px-6 sm:px-8 py-4">
                                    <Button
                                        asChild
                                        className="w-full"
                                        variant="outline">
                                        <Link href="#">Get Started</Link>
                                    </Button>
                                </div>

                                <ul
                                    role="list"
                                    className="space-y-3 p-6 sm:p-8">
                                    {['Everything in Pro Plan', '5GB Cloud Storage', 'Email and Chat Support'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check
                                                className="text-primary size-3"
                                                strokeWidth={3.5}
                                            />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    )
}