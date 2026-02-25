"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@featul/ui/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@featul/ui/components/dialog"

function Command({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn("text-foreground flex h-full w-full flex-col overflow-hidden", className)}
      {...props}
    />
  )
}

type CommandDialogProps = Omit<
  React.ComponentProps<typeof Dialog>,
  "children"
> & {
  title?: string
  children?: React.ReactNode
  width?: "default" | "wide" | "widest" | "xl" | "xxl"
  offsetY?: string | number
  icon?: React.ReactNode
}

function CommandDialog({
  title = "Command Palette",
  children,
  width = "default",
  offsetY = "15%",
  icon,
  ...props
}: CommandDialogProps) {
  const styleWidth =
    width === "xxl"
      ? { width: "min(92vw, 1120px)", maxWidth: "none" as const }
      : width === "xl"
      ? { width: "min(92vw, 780px)", maxWidth: "none" as const }
      : width === "widest"
      ? { width: "min(92vw, 680px)", maxWidth: "none" as const }
      : width === "wide"
      ? { width: "min(92vw, 520px)", maxWidth: "none" as const }
      : { width: "min(92vw, 450px)", maxWidth: "none" as const }

  const topValue = typeof offsetY === "number" ? `${offsetY}%` : offsetY
  const positionStyle = { top: topValue, ["--tw-translate-y" as any]: `-${topValue}` }

  return (
    <Dialog open={props.open ?? false} onOpenChange={props.onOpenChange}>
      <DialogContent fluid style={{ ...styleWidth, ...positionStyle }} className="max-w-none sm:max-w-none p-1 bg-muted rounded-2xl gap-1">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <DialogTitle className="flex items-center gap-2 px-2 mt-0.5 py-0.5 text-sm font-normal">
            {icon ?? <SearchIcon className="size-3.5 opacity-80" />}
            {title}
          </DialogTitle>
        </DialogHeader>
        <div className="bg-card rounded-xl p-2 dark:bg-black/40 border border-border">
          <Command className="">
            {children}
          </Command>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="bg-card dark:bg-black/5 flex h-8 items-center gap-3  px-6"
    >
      <SearchIcon className="size-5 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-accent flex h-12 w-full rounded-md  bg-transparent px-3 py-3 text-md outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </div>
  )
}

function CommandList({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-[500px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
      {...props}
    />
  )
}

function CommandEmpty({
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return (
    <CommandPrimitive.Empty
      data-slot="command-empty"
      className="hidden"
      {...props}
    />
  )
}

function CommandGroup({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn("text-foreground overflow-hidden", className)}
      {...props}
    />
  )
}

function CommandSeparator({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px my-2", className)}
      {...props}
    />
  )
}

function CommandItem({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn("bg-transparent text-muted-foreground hover:bg-primary/20 hover:text-black aria-selected:bg-primary/20 aria-selected:text-primary [&_svg:not([class*='text-'])]:text-muted-foreground relative flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 my-1 text-sm outline-hidden select-none transition-colors duration-150 data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", className)}
      {...props}
    />
  )
}

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "text-muted-foreground ml-auto text-xs tracking-widest",
        className
      )}
      {...props}
    />
  )
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
}
