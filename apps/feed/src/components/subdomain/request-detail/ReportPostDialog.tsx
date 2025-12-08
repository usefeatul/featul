"use client"

import React, { useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@feedgot/ui/components/dialog"
import { Button } from "@feedgot/ui/components/button"
import { Label } from "@feedgot/ui/components/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@feedgot/ui/components/select"
import { Textarea } from "@feedgot/ui/components/textarea"
import { client } from "@feedgot/api/client"
import { toast } from "sonner"

interface ReportPostDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  postId: string
}

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment" },
  { value: "inappropriate", label: "Inappropriate Content" },
  { value: "off_topic", label: "Off Topic" },
  { value: "other", label: "Other" },
]

export default function ReportPostDialog({
  open,
  onOpenChange,
  postId,
}: ReportPostDialogProps) {
  const [reason, setReason] = useState<string>("spam")
  const [description, setDescription] = useState("")
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    startTransition(async () => {
      try {
        const res = await client.post.report.$post({
          postId,
          reason: reason as any,
          description,
        })

        if (res.ok) {
          toast.success("Post reported. Thank you for your feedback.")
          onOpenChange(false)
          setReason("spam")
          setDescription("")
        } else {
          toast.error("Failed to report post")
        }
      } catch (error) {
        console.error("Failed to report post:", error)
        toast.error("Failed to report post")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Post</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this post.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional Details (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Please provide any additional context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="resize-none"
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
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
