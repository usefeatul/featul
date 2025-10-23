import Link from 'next/link'
import { Play, Star, Users, Zap } from 'lucide-react'
import { Container } from './container'
import { FreeIcon } from '@feedgot/ui/icons/free'
import { UsersIcon } from '@feedgot/ui/icons/users'
import { SetupIcon } from '@feedgot/ui/icons/setup'

interface FeatureHighlight {
  icon: React.ComponentType<{ className?: string }>
  text: string
}

const featureHighlights: FeatureHighlight[] = [
  { icon: Star, text: 'Free forever' },
  { icon: Zap, text: '30-second setup' },
  { icon: Users, text: 'Unlimited users' },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">

      <Container maxWidth="5xl">
        <div className="pt-10 pb-24 sm:pt-16 sm:pb-32">
          <div className="max-w-4xl text-left">
            {/* Main heading */}
            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl">
              The
              <span className="mx-2 inline-block rounded-md bg-primary/15 px-3 py-1 text-primary">
                simple and joyful
              </span>
              Google Analytics alternative
            </h1>

            {/* Subtitle */}
            <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              feedgot is a complete SaaS feedback platform featuring organized feedback boards, auto-syncing roadmaps, self-writing changelogs, and automated engagement loops
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-col items-start justify-start gap-4 sm:flex-row sm:gap-6">
              <Link
                href="/signup"
                className="inline-flex items-center rounded-md bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add to your website
              </Link>
              <Link
                href="/demo"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
              >
                <Play className="h-4 w-4" />
                View live demo
              </Link>
            </div>

            {/* Feature highlights row */}
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <FreeIcon width={18} height={18} className="text-foreground" />
                Free forever
              </span>
              <span className="inline-flex items-center gap-2">
                <SetupIcon width={18} height={18} className="text-foreground" />
                30-second setup
              </span>
              <span className="inline-flex items-center gap-2">
                <UsersIcon width={18} height={18} className="text-foreground" />
                Unlimited users
              </span>
            </div>
          </div>

          {/* Screenshot placeholder card */}
          <div className="mt-12 max-w-5xl rounded-2xl border border-border bg-white">
            <div className="aspect-[16/9] w-full rounded-2xl bg-muted" />
            <div className="px-4 py-2 text-center text-xs text-muted-foreground">
              Dashboard • Click to switch between our core features
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}