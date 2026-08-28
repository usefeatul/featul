"use client"

import * as React from "react"

import { cn } from "@featul/ui/lib/utils"

type TableVariant = "default" | "settings"

const TableVariantContext = React.createContext<TableVariant>("default")

type TableProps = React.ComponentProps<"table"> & {
  variant?: TableVariant
  containerClassName?: string
}

function Table({
  className,
  variant = "default",
  containerClassName,
  ...props
}: TableProps) {
  return (
    <TableVariantContext.Provider value={variant}>
      <div
        data-slot="table-container"
        className={cn(
          "relative w-full overflow-x-auto",
          variant === "default" &&
            "rounded-xl border border-border/60 bg-background",
          variant === "settings" &&
            "overflow-hidden rounded-xl border border-border/60 bg-background dark:border-white/10 dark:bg-black/30",
          containerClassName,
        )}
      >
        <table
          data-slot="table"
          className={cn("w-full caption-bottom text-sm", className)}
          {...props}
        />
      </div>
    </TableVariantContext.Provider>
  )
}

function useTableVariant() {
  return React.useContext(TableVariantContext)
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  const variant = useTableVariant()

  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&_tr]:border-b",
        variant === "default" && "[&_tr]:border-border/60",
        variant === "settings" &&
          "[&_tr]:border-border/60 [&_tr]:bg-muted/20 dark:[&_tr]:border-white/10 dark:[&_tr]:bg-white/[0.02]",
        className,
      )}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "border-t border-border/60 bg-transparent font-medium [&>tr]:last:border-b-0",
        className,
      )}
      {...props}
    />
  )
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  const variant = useTableVariant()

  return (
    <tr
      data-slot="table-row"
      className={cn(
        "border-b transition-colors data-[state=selected]:bg-muted/30",
        variant === "default" &&
          "border-border/50 hover:bg-muted/20 data-[state=selected]:bg-muted/30",
        variant === "settings" &&
          "border-border/50 hover:bg-muted/10 dark:border-white/10 dark:hover:bg-white/[0.03]",
        className,
      )}
      {...props}
    />
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const variant = useTableVariant()

  return (
    <th
      data-slot="table-head"
      className={cn(
        "h-9 px-3 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        variant === "default" && "text-muted-foreground",
        variant === "settings" && "text-sm text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const variant = useTableVariant()

  return (
    <td
      data-slot="table-cell"
      className={cn(
        "px-3 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        variant === "default" && "py-2.5",
        variant === "settings" && "py-3 text-sm text-foreground",
        className,
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
