"use client"

import * as React from "react"
import { Dialog as BaseDialog } from "@base-ui/react/dialog"
import { motion } from "framer-motion"

import { cn } from "@oreilla/ui/lib/utils"

const Dialog = BaseDialog.Root

const DialogTrigger = BaseDialog.Trigger

const DialogPortal = BaseDialog.Portal

const DialogClose = BaseDialog.Close

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof BaseDialog.Backdrop>,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Backdrop>
>(({ className, ...props }, ref) => (
  <BaseDialog.Backdrop
    ref={ref as any}
    data-slot="dialog-overlay"
    className={cn(
      "fixed inset-0 z-40 bg-black/30 backdrop-blur-sm",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = "DialogOverlay"

type DialogContentProps = Omit<
  React.ComponentPropsWithoutRef<typeof BaseDialog.Popup>,
  "children"
> & {
  children?: React.ReactNode
}

const DialogContent = React.forwardRef<
  React.ElementRef<typeof BaseDialog.Popup>,
  DialogContentProps
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <BaseDialog.Popup
      data-slot="dialog-content"
      {...props}
    >
      <motion.div
        ref={ref as any}
        className={cn(
          // Match the original Radix positioning: centered by default,
          // but allow callers to override with their own top/translate classes.
          "fixed left-1/2 top-1/2 z-40 grid w-[min(92vw,600px)] translate-x-[-50%] translate-y-[-50%] gap-4 bg-card p-5 border ring-1 ring-border shadow-2xl rounded-sm",
          className
        )}
        initial={{ opacity: 0, scale: 0.95, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -12 }}
        transition={{ type: "spring", stiffness: 350, damping: 25, mass: 0.6 }}
      >
        {children}
      </motion.div>
    </BaseDialog.Popup>
  </DialogPortal>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col space-y-2 text-center sm:text-left",
      className
    )}
    {...props}
  />
)
DialogHeader.displayName = "DialogHeader"

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
)
DialogFooter.displayName = "DialogFooter"

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof BaseDialog.Title>,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Title>
>(({ className, ...props }, ref) => (
  <BaseDialog.Title
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      className
    )}
    {...props}
  />
))
DialogTitle.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof BaseDialog.Description>,
  React.ComponentPropsWithoutRef<typeof BaseDialog.Description>
>(({ className, ...props }, ref) => (
  <BaseDialog.Description
    ref={ref}
    className={cn("text-sm text-accent", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
