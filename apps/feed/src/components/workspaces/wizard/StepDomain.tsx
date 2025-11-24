"use client"

import { Input } from "@feedgot/ui/components/input"
import { AlertCircle } from "lucide-react"
import { suggestDomainFix } from "./validators"

export default function StepDomain({ domain, onChange, isValid }: { domain: string; onChange: (v: string) => void; isValid: boolean }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">First things first.</h2>
        <p className="text-xs sm:text-sm text-accent">Which website do you want to collect feedback for?</p>
      </div>
      <div className="space-y-2">
        <div className="relative flex items-center">
          <span className="inline-flex items-center h-10 px-3 bg-accent/50 border rounded-l-md text-black select-none">https://</span>
          <Input id="domain" type="text" value={domain} onChange={(e) => onChange(e.target.value)} placeholder="mywebsite.com" className="h-10 flex-1 rounded-l-none border-l-0 placeholder:text-accent/70" aria-invalid={!isValid && domain.length > 0} />
          {!isValid && domain.length > 0 ? (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive size-4" />
          ) : null}
        </div>
        {(() => {
          if (!isValid && domain.length > 0) {
            const suggested = suggestDomainFix(domain)
            if (suggested) {
              return (
                <p className="text-xs text-accent">
                  Did you mean <button type="button" className="underline text-primary cursor-pointer" onClick={() => onChange(suggested)}>{suggested}</button>?
                </p>
              )
            }
            return (
              <p className="text-xs text-destructive ">Enter a valid domain, e.g. <span className="underline" onClick={() => onChange("mywebsite.com")}>mywebsite.com</span>.</p>
            )
          }
          return null
        })()}
      </div>
    </div>
  )
}