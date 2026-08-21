import * as React from "react"

import { overlayDialogClass, overlayInnerClass } from "@featul/ui/lib/overlay"
import { cn } from "@featul/ui/lib/utils"

interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "plain"
}

function Card({ className, variant = "default", children, ...props }: CardProps) {
  if (variant === "plain") {
    return (
      <div
        data-slot="card"
        className={cn(
          "bg-card dark:bg-black text-card-foreground flex flex-col gap-6 rounded-md py-6 outline-none",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  return (
    <div
      data-slot="card"
      className={cn(
        overlayDialogClass,
        "flex flex-col text-card-foreground outline-none",
        className,
      )}
      {...props}
    >
      <div className={cn(overlayInnerClass, "flex flex-1 flex-col gap-6 py-6")}>
        {children}
      </div>
    </div>
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start gap-2 px-6 has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-semibold", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("px-6", className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
