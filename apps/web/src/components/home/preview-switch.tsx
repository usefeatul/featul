"use client"
import { Button } from '@feedgot/ui/components/button'
import type { PreviewKey } from './hooks/usePreviewHint'

type Props = {
  active: PreviewKey
  onChange: (next: PreviewKey) => void
  showHint?: boolean
}

export function PreviewSwitchPill({ active, onChange, showHint }: Props) {
  return (
    <div className="pointer-events-none absolute left-1/2 bottom-[1px] -translate-x-1/2 w-screen z-20">
      <div className="relative">
        <div className="absolute inset-x-0 -top-[2px] h-[15px] border-t border-border bg-background"></div>
      </div>

      <div className="pointer-events-auto absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-30">
        <div className="relative flex items-center gap-1.5 rounded-xl bg-white/80 backdrop-blur-md ring-1 ring-border/60 shadow-2xl px-2 py-1.5">
          {showHint && (
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-2 ring-border/60 animate-pulse"></div>
          )}

          <div role="group" aria-label="Preview feature" className="relative z-10 inline-flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              className={`${active === 'dashboard' ? 'bg-primary text-white border border-border' : 'bg-transparent text-muted-foreground hover:bg-white/70'} rounded-xl px-2`}
              onClick={() => onChange('dashboard')}
              aria-pressed={active === 'dashboard'}
            >
              Dashboard
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`${active === 'roadmap' ? 'bg-primary text-white border border-border' : 'bg-transparent text-muted-foreground hover:bg-white/70'} rounded-xl px-2`}
              onClick={() => onChange('roadmap')}
              aria-pressed={active === 'roadmap'}
            >
              Roadmap
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className={`${active === 'changelog' ? 'bg-primary text-white border border-border' : 'bg-transparent text-muted-foreground hover:bg-white/70'} rounded-xl px-2`}
              onClick={() => onChange('changelog')}
              aria-pressed={active === 'changelog'}
            >
              Changelog
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}