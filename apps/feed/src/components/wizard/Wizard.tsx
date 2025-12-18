"use client";

import { Button } from "@oreilla/ui/components/button";
import { Input } from "@oreilla/ui/components/input";
import { Label } from "@oreilla/ui/components/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@oreilla/ui/components/card";
import TimezonePicker from "./TimezonePicker";
import { ArrowRight, Loader2, AlertCircle, Link2 } from "lucide-react";
import CompletedIcon from "@oreilla/ui/icons/completed";
import ClosedIcon from "@oreilla/ui/icons/closed";
import { useWizardLogic } from "./useWizardLogic";
import {
  isNameValid,
  isDomainValid,
  isSlugValid,
  isTimezoneValid,
  suggestDomainFix,
} from "../../lib/validators";

export default function WorkspaceWizard({
  className = "",
}: {
  className?: string;
}) {
  const {
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
  } = useWizardLogic();

  const isFormValid = 
    isNameValid(name) && 
    isDomainValid(domain) && 
    (slugLocked ? true : (isSlugValid(slug) && slugAvailable === true)) &&
    isTimezoneValid(timezone);

  return (
    <Card className={`w-full max-w-[480px] mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-xl">Create new project</CardTitle>
        <CardDescription>
          Tell us a bit about the website you want to track.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Project"
                className="h-10 bg-muted/50"
                autoFocus
              />
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <Label htmlFor="domain">Domain</Label>
              <div className="relative flex items-center">
                <span className="inline-flex items-center h-10 px-3 bg-muted border rounded-l-md text-muted-foreground select-none text-sm border-r-0">
                  https://
                </span>
                <Input
                  id="domain"
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="example.com"
                  className="h-10 flex-1 rounded-l-none bg-muted/50"
                />
              </div>
              {!domainValid && domain.length > 0 && (
                <div className="text-xs text-destructive flex items-center gap-1 mt-1.5">
                  <AlertCircle className="size-3" />
                  <span>Invalid domain format</span>
                  {(() => {
                    const suggested = suggestDomainFix(domain);
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
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            {/* Slug (Optional/Advanced) */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="flex items-center gap-2">
                Workspace URL
                {slugLocked && (
                  <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded text-muted-foreground font-normal">
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
                  className="h-10 pl-9 pr-24 bg-muted/50"
                  disabled={!!slugLocked}
                />
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  .oreilla.com
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

            {/* Timezone */}
            <div className="space-y-2">
              <Label>Timezone</Label>
              <TimezonePicker value={timezone} onChange={setTimezone} now={now} />
              <p className="text-[11px] text-muted-foreground">
                All project graphs, ranges and timestamps will be matched to this
                timezone. Can be updated later.
              </p>
            </div>
          </CardContent>
          <CardFooter>
            {/* Submit */}
            <Button
              type="button"
              className="w-full"
              size="lg"
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
  );
}
