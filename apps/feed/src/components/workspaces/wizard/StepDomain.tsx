"use client"

import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"
import { AlertCircle } from "lucide-react"

export default function StepDomain({ domain, onChange, isValid }: { domain: string; onChange: (v: string) => void; isValid: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">First things first.</h2>
        <p className="text-sm text-accent">Which website do you want to collect feedback for?</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="domain" className="block text-sm">Website</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-accent">https://</span>
          <Input id="domain" type="text" value={domain} onChange={(e) => onChange(e.target.value)} placeholder="mywebsite.com" className="pl-16" aria-invalid={!isValid && domain.length > 0} />
          {!isValid && domain.length > 0 ? (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive size-4" />
          ) : null}
        </div>
      </div>
    </div>
  )
}