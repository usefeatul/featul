"use client"

import { Input } from "@feedgot/ui/components/input"
import { Link2, Loader2 } from "lucide-react"
import  CompletedIcon  from "@feedgot/ui/icons/completed"
import ClosedIcon from "@feedgot/ui/icons/closed"
import { isSlugValid } from "../../lib/validators"

export default function StepSlug({ slug, onChange, checking, available }: { slug: string; onChange: (v: string) => void; checking: boolean; available: boolean | null }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-semibold">Choose a subdomain.</h2>
        <p className="text-xs sm:text-sm text-accent">This will be used for your workspace URL.</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-accent" />
            <Input
              id="slug"
              value={slug}
              onChange={(e) => onChange(e.target.value)}
              placeholder="mywebsite"
              className="w-full placeholder:text-accent/70 pl-9 sm:pl-10 pr-16 sm:pr-24"
              aria-invalid={available === false || (!!slug && !isSlugValid(slug))}
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs sm:text-sm text-accent select-none pointer-events-none">.feedgot.com</span>
          </div>
          <div className="flex items-center gap-2">
            {checking ? (
              <Loader2 className="size-4 text-accent animate-spin" />
            ) : available === true ? (
              <CompletedIcon size={16} className="text-emerald-600" />
            ) : available === false || (!!slug && !isSlugValid(slug)) ? (
              <ClosedIcon size={16} className="text-destructive" />
            ) : null}
          </div>
        </div>
        {(() => {
          if (!!slug && !isSlugValid(slug)) {
            return <p className="text-xs text-destructive">Only lowercase letters, minimum 5 characters.</p>
          }
          if (available === false) {
            return <p className="text-xs text-destructive">This subdomain is already taken.</p>
          }
          return null
        })()}
      </div>
    </div>
  )
}