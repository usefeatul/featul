"use client"

import { Label } from "@feedgot/ui/components/label"
import { Input } from "@feedgot/ui/components/input"
import { AlertCircle } from "lucide-react"
import { suggestDomainFix } from "./validators"

export default function StepDomain({ domain, onChange, isValid }: { domain: string; onChange: (v: string) => void; isValid: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">First things first.</h2>
        <p className="text-sm text-accent">Which website do you want to collect feedback for?</p>
      </div>
      <div className="space-y-2">
        <div className="relative flex items-center">
          <span className="inline-flex items-center h-10 px-3 bg-muted border rounded-l-md text-accent select-none">https://</span>
          <Input id="domain" type="text" value={domain} onChange={(e) => onChange(e.target.value)} placeholder="mywebsite.com" className="h-10 flex-1 rounded-l-none border-l-0 placeholder:text-accent/70" aria-invalid={!isValid && domain.length > 0} />
          {!isValid && domain.length > 0 ? (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive size-4" />
          ) : null}
          {(() => {
            const suggested = suggestDomainFix(domain)
            return !isValid && suggested ? (
              <div className="absolute left-3 -bottom-6 text-xs text-accent">
                Did you mean <button type="button" className="underline" onClick={() => onChange(suggested)}>{suggested}</button>?
              </div>
            ) : null
          })()}
        </div>
      </div>
    </div>
  )
}