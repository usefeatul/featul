"use client"

import { Button } from "@featul/ui/components/button"
import { Loader2 } from "lucide-react"
import * as React from "react"

export function LoadingButton({ loading = false, disabled, children, className, ...props }: React.ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button
      aria-busy={loading}
      disabled={loading || disabled}
      className={className}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : null}
      {children}
    </Button>
  )
}