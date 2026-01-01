"use client"

import * as React from "react"
import { Accordion as BaseAccordion } from "@base-ui/react/accordion"
import { ChevronDownIcon } from "lucide-react"

import { cn } from "@featul/ui/lib/utils"

interface AccordionProps
  extends React.ComponentProps<typeof BaseAccordion.Root> {
  type?: "single" | "multiple"
  collapsible?: boolean
}

function Accordion({
  type = "single",
  collapsible,
  ...props
}: AccordionProps) {
  const multiple = type === "multiple"

  return (
    <BaseAccordion.Root
      data-slot="accordion"
      multiple={multiple}
      {...props}
    />
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Item>) {
  return (
    <BaseAccordion.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Trigger>) {
  return (
    <BaseAccordion.Header className="flex">
      <BaseAccordion.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md  py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&[data-state=open]>svg]:rotate-180",
          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon className="text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200" />
      </BaseAccordion.Trigger>
    </BaseAccordion.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof BaseAccordion.Panel>) {
  return (
    <BaseAccordion.Panel
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
        className
      )}
      {...props}
    >
      <div className="pt-0 pb-4">{children}</div>
    </BaseAccordion.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
