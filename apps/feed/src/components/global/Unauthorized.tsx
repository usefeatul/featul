"use client"

import React from "react"
import { Button } from "@feedgot/ui/components/button"

export default function UnauthorizedWorkspace({ slug, fallbackSlug }: { slug: string; fallbackSlug?: string | null }) {
  return (
    <section className="flex min-h-screen items-center justify-center bg-background px-4 sm:px-5">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl sm:text-4xl font-semibold">Not authorized</h1>
          </div>
          <p className="mt-2 text-md sm:text-lg text-accent">
            You don’t have access to <span className="font-mono">{slug}</span>.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
            {fallbackSlug ? (
              <Button asChild variant="quiet">
                <a href={`/workspaces/${fallbackSlug}`}>Go to my workspace</a>
              </Button>
            ) : (
              <Button asChild variant="quiet">
                <a href="/workspaces/new">Create a workspace</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
