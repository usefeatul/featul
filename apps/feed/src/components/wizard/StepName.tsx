"use client"

import { Input } from "@oreilla/ui/components/input"

export default function StepName({ name, onChange, isValid }: { name: string; onChange: (v: string) => void; isValid: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">What product or project is this for?</h2>
        <p className="text-xs sm:text-sm text-accent">
          We&apos;ll use this name across your feedback boards, roadmap and emails.
        </p>
      </div>
      <div className="space-y-2">
        <Input
          id="name"
          value={name}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Acme Analytics"
          className="placeholder:text-accent/70"
          aria-invalid={!isValid && name.length > 0}
        />
        {!isValid && name.length > 0 ? (
          <p className="text-xs text-destructive">Name is required.</p>
        ) : null}
      </div>
    </div>
  )
}
