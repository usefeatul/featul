"use client"

import React from "react"
import { cn } from "@featul/ui/lib/utils"
import { LoaderIcon } from "@/components/global/icons";

interface LoadingSpinnerProps {
  label?: string
  className?: string
}

export function LoadingSpinner({ label = "Loading...", className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2 py-6 text-sm text-accent", className)}>
      <LoaderIcon className="size-4" />
      <span>{label}</span>
    </div>
  )
}
