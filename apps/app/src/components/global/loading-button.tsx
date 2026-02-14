"use client"

import { Button } from "@featul/ui/components/button"
import { Loader2 } from "lucide-react"
import * as React from "react"

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
  loadingIcon?: React.ReactNode
}

export function LoadingButton({
  loading = false,
  disabled,
  children,
  className,
  loadingIcon,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      aria-busy={loading}
      disabled={loading || disabled}
      className={className}
      {...props}
    >
      {loading ? (loadingIcon ?? <Loader2 className="size-4 animate-spin" />) : null}
      {children}
    </Button>
  )
}
