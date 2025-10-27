
import { Hero } from '../components/hero'
import  Feature  from '../components/feature'
import Faq  from '../components/faq'
import BentoFeature from '../components/bento-feature'
import Pricing from '../components/pricing'

export default async function Home() {
  return (
    <main className="min-h-screen pt-16">
      <Hero />
      <BentoFeature />
      <Feature />
      <Pricing />
      <Faq />
    </main>
  )
}
