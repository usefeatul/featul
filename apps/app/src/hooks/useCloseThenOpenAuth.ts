"use client"

import React from "react"
import type { AuthMode } from "@/types/auth"

interface UseCloseThenOpenAuthProps {
  closeCurrent: () => void
  openAuth: (mode: AuthMode) => void
}

export function useCloseThenOpenAuth({
  closeCurrent,
  openAuth,
}: UseCloseThenOpenAuthProps) {
  const openTimeoutRef = React.useRef<number | null>(null)

  React.useEffect(() => {
    return () => {
      if (openTimeoutRef.current !== null) {
        window.clearTimeout(openTimeoutRef.current)
      }
    }
  }, [])

  const closeThenOpenAuth = React.useCallback(
    (mode: AuthMode = "sign-in") => {
      closeCurrent()

      if (openTimeoutRef.current !== null) {
        window.clearTimeout(openTimeoutRef.current)
      }

      openTimeoutRef.current = window.setTimeout(() => {
        openAuth(mode)
        openTimeoutRef.current = null
      }, 0)
    },
    [closeCurrent, openAuth]
  )

  return { closeThenOpenAuth }
}
