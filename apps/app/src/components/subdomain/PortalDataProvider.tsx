"use client"

import * as React from "react"
import type { PortalBoard, PortalStatusCounts } from "@/app/[subdomain]/data"

export type PortalData = {
  subdomain: string
  workspaceName: string
  boards: PortalBoard[]
  statusCounts: PortalStatusCounts
  totalPosts: number
  changelogCount: number
  roadmapVisible: boolean
  changelogVisible: boolean
  helpVisible: boolean
}

const PortalDataContext = React.createContext<PortalData | null>(null)

/** Portal-wide counts and boards loaded once in the subdomain layout. */
export function PortalDataProvider({
  value,
  children,
}: {
  value: PortalData
  children: React.ReactNode
}) {
  return <PortalDataContext.Provider value={value}>{children}</PortalDataContext.Provider>
}

export function usePortalData(): PortalData {
  const ctx = React.useContext(PortalDataContext)
  if (!ctx) {
    throw new Error("usePortalData must be used inside PortalDataProvider")
  }
  return ctx
}
