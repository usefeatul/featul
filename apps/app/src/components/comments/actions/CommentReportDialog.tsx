"use client"

import React, { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@featul/ui/components/dialog"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  PopoverList,
  PopoverListItem,
} from "@featul/ui/components/popover"
import { Button } from "@featul/ui/components/button"
import { Label } from "@featul/ui/components/label"
import { Textarea } from "@featul/ui/components/textarea"
import { client } from "@featul/api/client"
import { toast } from "sonner"
import { ChevronsUpDown } from "lucide-react"
import { cn } from "@featul/ui/lib/utils"

interface CommentReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  commentId: string
}

const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment or bullying" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "off_topic", label: "Off-topic" },
  { value: "other", label: "Other" },
] as const
type ReportReason = (typeof REPORT_REASONS)[number]["value"]

export default function CommentReportDialog({
  open,
  onOpenChange,
  commentId,
}: CommentReportDialogProps) {
  const [isPending, startTransition] = useTransition()
  const [reason, setReason] = useState<ReportReason | "">("")
  const [description, setDescription] = useState("")
  const [reasonOpen, setReasonOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    startTransition(async () => {
      try {
        const res = await client.comment.report.$post({
          commentId,
          reason,
          description,
        })

        if (res.ok) {
          toast.success("Report submitted successfully")
          onOpenChange(false)
          setReason("")
          setDescription("")
        } else if (res.status === 401) {
          toast.error("Please sign in to report")
        } else {
          toast.error("Failed to submit report")
        }
      } catch (error) {
        console.error("Failed to report comment:", error)
        toast.error("Failed to submit report")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Comment</DialogTitle>
          <DialogDescription className="text-accent">
            Please select a reason for reporting this comment. Our team will review it shortly.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Popover open={reasonOpen} onOpenChange={setReasonOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={reasonOpen}
                  className="w-full justify-between"
                >
                  {reason
                    ? REPORT_REASONS.find((r) => r.value === reason)?.label
                    : "Select a reason"}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-fit p-0" align="start" list>
                <PopoverList>
                  {REPORT_REASONS.map((r) => (
                    <PopoverListItem
                      key={r.value}
                      onClick={() => {
                        setReason(r.value)
                        setReasonOpen(false)
                      }}
                    >
                      <span className={cn("text-sm", reason === r.value && "font-medium")}>
                        {r.label}
                      </span>
                    </PopoverListItem>
                  ))}
                </PopoverList>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">
              Description <span className="text-muted-foreground text-xs">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide additional details..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none placeholder:text-accent"
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!reason || isPending}>
              {isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
