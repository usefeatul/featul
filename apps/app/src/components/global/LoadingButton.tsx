"use client"

import { Button } from "@featul/ui/components/button"
import { LoaderIcon } from "@/components/global/icons";
import * as React from "react"

type LoadingButtonProps = React.ComponentProps<typeof Button> & {
  loading?: boolean
}

export function LoadingButton({
  loading = false,
  disabled,
  children,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      aria-busy={loading}
      disabled={loading || disabled}
      className={className}
      {...props}
    >
      {loading ? <LoaderIcon className="size-4" /> : null}
      {children}
    </Button>
  )
}
