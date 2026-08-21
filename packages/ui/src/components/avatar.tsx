"use client"

import * as React from "react"
import { Avatar as BaseAvatar } from "@base-ui/react/avatar"

import { overlayAvatarInnerClass, overlayAvatarShellClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof BaseAvatar.Root>) {
  return (
    <BaseAvatar.Root
      data-slot="avatar"
      className={cn(overlayAvatarShellClass, "size-8", className)}
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
        overlayAvatarInnerClass,
        "aspect-square bg-accent/10 dark:bg-black/10",
        "[[src*='data:image/svg+xml']]:dark:brightness-100 [[src*='data:image/svg+xml']]:brightness-0",
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
        overlayAvatarInnerClass,
        "flex items-center justify-center",
        className
      )}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback }
