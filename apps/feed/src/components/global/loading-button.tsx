"use client"

import { Button } from "@feedgot/ui/components/button"
import { Loader2 } from "lucide-react"
import * as React from "react"

export function LoadingButton({ loading = false, disabled, children, className, ...props }: React.ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button
      aria-busy={loading}
      disabled={loading || disabled}
      className={className}
      variant="quiet"
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  )
}