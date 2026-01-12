import { Button } from "@featul/ui/components/button"
import { Input } from "@featul/ui/components/input"
import { Label } from "@featul/ui/components/label"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@featul/ui/components/card"
import TimezonePicker from "./TimezonePicker"
import { ArrowRight, Loader2, AlertCircle, Link2 } from "lucide-react"
import CompletedIcon from "@featul/ui/icons/completed"
import ClosedIcon from "@featul/ui/icons/closed"
import {
  isNameValid,
  isDomainValid,
  isSlugValid,
  isTimezoneValid,
  suggestDomainFix,
} from "../../lib/validators"

type WizardFormProps = {
  className?: string
  name: string
  setName: (v: string) => void
  domain: string
  setDomain: (v: string) => void
  slug: string
  handleSlugChange: (v: string) => void
  slugChecking: boolean
  slugAvailable: boolean | null
  slugLocked: string | null
  timezone: string
  setTimezone: (v: string) => void
  now: Date
  isCreating: boolean
  domainValid: boolean
  create: () => void | Promise<void>
}

export default function WizardForm({
  className = "",
  name,
  setName,
  domain,
  setDomain,
  slug,
  handleSlugChange,
  slugChecking,
  slugAvailable,
  slugLocked,
  timezone,
  setTimezone,
  now,
  isCreating,
  domainValid,
  create,
}: WizardFormProps) {
  const isFormValid =
    isNameValid(name) &&
    isDomainValid(domain) &&
    (slugLocked ? true : isSlugValid(slug) && slugAvailable === true) &&
    isTimezoneValid(timezone)

  return (
    <Card className={`w-full  max-w-[380px] mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl">Create new project</CardTitle>
        <CardDescription className="text-accent">
          Tell us a bit about the website you need feedback for.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Project"
            className="h-9 bg-muted/50 placeholder:text-accent"
            autoFocus
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="domain">Domain</Label>
          <div className="relative flex items-center">
            <span className="inline-flex items-center h-9 px-3 bg-muted border rounded-l-md text-accent select-none text-sm border-r-0">
              https://
            </span>
            <Input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="example.com"
              className="h-9 flex-1 rounded-l-none bg-muted/50 placeholder:text-accent"
            />
          </div>
          {!domainValid && domain.length > 0 && (
            <div className="text-xs text-destructive flex items-center gap-1 mt-1.5">
              <AlertCircle className="size-3" />
              <span>Invalid domain format</span>
              {(() => {
                const suggested = suggestDomainFix(domain)
                if (suggested) {
                  return (
                    <>
                      <span>— did you mean </span>
                      <button
                        type="button"
                        className="underline hover:text-destructive/80"
                        onClick={() => setDomain(suggested)}
                      >
                        {suggested}
                      </button>
                      ?
                    </>
                  )
                }
                return null
              })()}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug" className="flex items-center gap-2">
            Workspace URL
            {slugLocked && (
              <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal">
                Reserved
              </span>
            )}
          </Label>
          <div className="relative">
            <Input
              id="slug"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="project-slug"
              className="h-9 pl-9 pr-24 bg-muted/50 placeholder:text-accent"
              disabled={!!slugLocked}
            />
            <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
              .featul.com
            </span>

            <div className="absolute right-[6.5rem] top-1/2 -translate-y-1/2">
              {slugChecking ? (
                <Loader2 className="size-4 text-muted-foreground animate-spin" />
              ) : !slugLocked && slug && slugAvailable === true ? (
                <CompletedIcon size={16} className="text-emerald-600" />
              ) : !slugLocked &&
                (slugAvailable === false || (slug && !isSlugValid(slug))) ? (
                <ClosedIcon size={16} className="text-destructive" />
              ) : null}
            </div>
          </div>
          {slug && !isSlugValid(slug) && (
            <p className="text-xs text-destructive">
              Use lowercase letters, numbers, and dashes (min 5 chars).
            </p>
          )}
          {!slugLocked && slugAvailable === false && (
            <p className="text-xs text-destructive">
              This URL is already taken.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Timezone</Label>
          <TimezonePicker value={timezone} onChange={setTimezone} now={now} />
          <p className="text-xs text-accent">
            All workspace graphs, ranges and timestamps will be matched to this
            timezone. Can be updated later.
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button
          type="button"
          className="w-full"
          size="sm"
          onClick={create}
          disabled={!isFormValid || isCreating}
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create project"
          )}
          {!isCreating && <ArrowRight className="ml-2 size-4 opacity-50" />}
        </Button>
      </CardFooter>
    </Card>
  )
}
