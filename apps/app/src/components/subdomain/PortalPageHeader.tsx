"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { usePortalData } from "./PortalDataProvider"

type Section = "feedback" | "roadmap" | "changelog"

function sectionFromPath(pathname: string): Section {
  if (pathname.startsWith("/roadmap")) return "roadmap"
  if (pathname.startsWith("/changelog")) return "changelog"
  return "feedback"
}

const copy: Record<Section, { title: string; description: (name: string) => string }> = {
  feedback: {
    title: "Feedback",
    description: (name) => `Share ideas, vote on what matters to you, and follow along as ${name} builds.`,
  },
  roadmap: {
    title: "Roadmap",
    description: () => "What's planned, what's in progress, and what recently shipped.",
  },
  changelog: {
    title: "Changelog",
    description: (name) => `New features, improvements and fixes in ${name}.`,
  },
}

/** Compact section heading above the content column: title and one-liner. */
export function PortalPageHeader() {
  const pathname = usePathname() || "/"
  const data = usePortalData()
  const { title, description } = copy[sectionFromPath(pathname)]

  return (
    <div className="mb-5 min-w-0">
      <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{description(data.workspaceName)}</p>
    </div>
  )
}
