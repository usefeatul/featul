"use client"

import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"

export default function StepName({ name, onChange }: { name: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Name your workspace.</h2>
        <p className="text-sm text-accent">A clear name helps your team identify it faster.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="name" className="block text-sm">Name</Label>
        <Input id="name" value={name} onChange={(e) => onChange(e.target.value)} placeholder="Mywebsite" />
      </div>
    </div>
  )
}