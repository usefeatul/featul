
import type { Metadata } from 'next'
import { createPageMetadata } from '@/lib/seo'
import { DEFAULT_DESCRIPTION } from '@/config/seo'
import { Hero } from '@/components/home/hero'
import Feature from '@/components/home/feature'
import Faq from '@/components/home/faq'
import BentoFeature from '@/components/home/bento-feature'
// import Pricing from '@/components/home/pricing'
import StatsSection from '@/components/home/cta'
import Setup from '@/components/home/setup'
import Create from '@/components/home/create'
import Listening from '@/components/home/listening'
import DebugTools from '@/components/dev/debug-tools'


export const metadata: Metadata = createPageMetadata({
  title: 'Privacy‑first product feedback, roadmaps, and changelogs | Feedgot',
  description: DEFAULT_DESCRIPTION,
  path: '/',
  absoluteTitle: true,
})

export default function Home() {
  return (
    <main className="min-h-screen pt-16 space-y-16 md:space-y-24">
      <Hero />
      <Listening />
      <BentoFeature />
      <Setup />
      <Feature />
      <Create />
      <Faq />
      <StatsSection />
      {/* Debug overlay and controls for layout alignment checks */}
      <DebugTools />
    </main>
  )
}
