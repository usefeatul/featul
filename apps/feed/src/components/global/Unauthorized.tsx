"use client"

import React from "react"
import { Button } from "@feedgot/ui/components/button"
import ShieldIcon from "@feedgot/ui/icons/shield"

export default function UnauthorizedWorkspace({ slug, fallbackSlug }: { slug: string; fallbackSlug?: string | null }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-5">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <ShieldIcon className="size-5 text-primary" opacity={1} />
            <h1 className="text-lg sm:text-2xl font-semibold">Not authorized</h1>
          </div>
          <p className="mt-2 text-sm sm:text-base text-accent">
            You don’t have access to <span className="font-mono">{slug}</span>.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {fallbackSlug ? (
              <Button asChild size="sm" variant="quiet">
                <a href={`/workspaces/${fallbackSlug}`}>Go to my workspace</a>
              </Button>
            ) : (
              <Button asChild size="sm" variant="quiet">
                <a href="/workspaces/new">Create a workspace</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
