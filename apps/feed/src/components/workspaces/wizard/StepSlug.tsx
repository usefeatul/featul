"use client"

import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"

export default function StepSlug({ slug, onChange, checking, available }: { slug: string; onChange: (v: string) => void; checking: boolean; available: boolean | null }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Choose a subdomain.</h2>
        <p className="text-sm text-accent">This will be used for your workspace URL.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="slug" className="block text-sm">Subdomain</Label>
        <div className="relative">
          <Input
            id="slug"
            value={slug}
            onChange={(e) => onChange(e.target.value)}
            placeholder="mywebsite"
            aria-invalid={available === false}
          />
          <div className={"absolute right-3 top-1/2 -translate-y-1/2 text-xs " + (checking ? "text-accent" : available === true ? "text-emerald-600" : available === false ? "text-destructive" : "text-accent")}>{checking ? "Checking..." : available === true ? "Available" : available === false ? "Taken" : ""}</div>
        </div>
        <p className="text-[12px] text-accent">Your workspace will be accessible at {slug ? `${slug}.feedgot.com` : "<slug>.feedgot.com"}.</p>
      </div>
    </div>
  )
}