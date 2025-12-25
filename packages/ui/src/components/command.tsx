"use client"

import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import { SearchIcon } from "lucide-react"

import { cn } from "@oreilla/ui/lib/utils"
import {
  Dialog,
} from "@oreilla/ui/components/dialog"
import { DialogShell } from "@oreilla/ui/components/dialog-shell"

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
  // description?: string
  children?: React.ReactNode
  width?: "default" | "wide" | "widest" | "xl" | "xxl"
  offsetY?: string | number
  icon?: React.ReactNode
}

function CommandDialog({
  title = "Command Palette",
  // description = "Search for a command to run...",
  children,
  width = "default",
  offsetY = "10%",
  icon,
  ...props
}: CommandDialogProps) {
  return (
    <DialogShell
      open={props.open ?? false}
      onOpenChange={props.onOpenChange as (v: boolean) => void}
      title={title}
      // description={description}
      width={width}
      offsetY={offsetY}
      icon={icon ?? <SearchIcon className="size-3.5 opacity-80" />}
    >
      <Command className="">
        {children}
      </Command>
    </DialogShell>
  )
}

function CommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="bg-card flex h-8 items-center gap-3  px-6"
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
      className={cn("max-h-[520px] scroll-py-1 overflow-x-hidden overflow-y-auto", className)}
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
