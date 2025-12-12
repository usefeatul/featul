"use client"

import { Input } from "@oreilla/ui/components/input"

export default function StepName({ name, onChange, isValid }: { name: string; onChange: (v: string) => void; isValid: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Name your workspace.</h2>
        <p className="text-xs sm:text-sm text-accent">A clear name helps your team identify it faster.</p>
      </div>
      <div className="space-y-2">
        <Input id="name" value={name} onChange={(e) => onChange(e.target.value)} placeholder="Mywebsite" className="placeholder:text-accent/70" aria-invalid={!isValid && name.length > 0} />
        {!isValid && name.length > 0 ? (
          <p className="text-xs text-destructive">Name is required.</p>
        ) : null}
      </div>
    </div>
  )
}
