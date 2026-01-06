"use client"

import * as React from "react"
import { Avatar as BaseAvatar } from "@base-ui/react/avatar"

import { cn } from "@featul/ui/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof BaseAvatar.Root>) {
  return (
    <BaseAvatar.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-8 shrink-0 overflow-hidden bg-accent/10 dark:bg-black/50 rounded-full",
        className
      )}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof BaseAvatar.Image>) {
  return (
    <BaseAvatar.Image
      data-slot="avatar-image"
      className={cn(
        "aspect-square bg-accent/10 dark:bg-black/10 rounded-full size-full",
        // Invert white SVGs in light mode for proper contrast (e.g., FeatulLogoIcon data URIs)
        "[[src*='data:image/svg+xml']]:dark:brightness-100 [[src*='data:image/svg+xml']]:brightness-0",
        // Ensure SVG data URIs are fully visible - less padding and larger scale for better visibility
        "[[src*='data:image/svg+xml']]:object-contain [[src*='data:image/svg+xml']]:p-1 [[src*='data:image/svg+xml']]:scale-90",
        className
      )}
      {...props}
    />
  )
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof BaseAvatar.Fallback>) {
  return (
    <BaseAvatar.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
