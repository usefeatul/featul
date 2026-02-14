"use client";

import React, { useState, useTransition } from "react";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { Button } from "@featul/ui/components/button";
import { Label } from "@featul/ui/components/label";
import {
  Popover,
  PopoverContent,
  PopoverList,
  PopoverListItem,
  PopoverTrigger,
} from "@featul/ui/components/popover";
import { Textarea } from "@featul/ui/components/textarea";
import { client } from "@featul/api/client";
import { toast } from "sonner";
import { FlagIcon } from "@featul/ui/icons/flag";
import { Check, ChevronsUpDown } from "lucide-react";

type ReportReason =
  | "spam"
  | "harassment"
  | "inappropriate"
  | "off_topic"
  | "other";

interface ReportPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  postId: string;
}

const REASONS: {
  value: ReportReason;
  label: string;
  hint: string;
  placeholder: string;
}[] = [
  {
    value: "spam",
    label: "Spam",
    hint: "Ads, scams, or repetitive promotions.",
    placeholder: "Share any links or details that look spammy.",
  },
  {
    value: "harassment",
    label: "Harassment",
    hint: "Bullying, threats, or targeted abuse.",
    placeholder: "Explain who was targeted and what happened.",
  },
  {
    value: "inappropriate",
    label: "Inappropriate content",
    hint: "Graphic, explicit, or unsafe material.",
    placeholder: "Tell us what part of the post is inappropriate.",
  },
  {
    value: "off_topic",
    label: "Off topic",
    hint: "Doesn't belong in this workspace or board.",
    placeholder: "Describe why this post is not relevant here.",
  },
  {
    value: "other",
    label: "Other",
    hint: "Something else not listed above.",
    placeholder: "Add any context that helps us review quickly.",
  },
];

export default function ReportPostDialog({
  open,
  onOpenChange,
  postId,
}: ReportPostDialogProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedReason = REASONS.find((r) => r.value === reason);
  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setReasonOpen(false);
      setReason("");
      setDescription("");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) return;

    startTransition(async () => {
      try {
        const res = await client.post.report.$post({
          postId,
          reason: reason as ReportReason,
          description,
        });

        if (res.ok) {
          toast.success("Post reported. Thank you for your feedback.");
          handleOpenChange(false);
        } else {
          toast.error("Failed to report post");
        }
      } catch (error) {
        console.error("Failed to report post:", error);
        toast.error("Failed to report post");
      }
    });
  };

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title="Report post"
      description="Help us understand what's wrong with this post."
      width="wide"
      icon={<FlagIcon className="size-3.5 text-muted-foreground" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label>Reason</Label>
          <Popover open={reasonOpen} onOpenChange={setReasonOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                role="combobox"
                aria-expanded={reasonOpen}
                className="h-auto min-h-11 w-full justify-between px-3 py-2"
              >
                <span className="min-w-0 text-left">
                  <span className="block text-sm font-medium leading-none">
                    {selectedReason?.label ?? "Select a reason"}
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground leading-relaxed">
                    {selectedReason?.hint ??
                      "Choose the reason that best fits this report."}
                  </span>
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-[320px] max-w-[var(--radix-popover-trigger-width)] p-0"
              align="start"
              list
            >
              <PopoverList>
                {REASONS.map((r) => (
                  <PopoverListItem
                    key={r.value}
                    onClick={() => {
                      setReason(r.value);
                      setReasonOpen(false);
                    }}
                    className="items-start gap-2 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none">
                        {r.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {r.hint}
                      </p>
                    </div>
                    {reason === r.value ? (
                      <Check className="ml-auto mt-0.5 h-4 w-4" />
                    ) : null}
                  </PopoverListItem>
                ))}
              </PopoverList>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="description">
              Additional details{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (Optional)
              </span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {description.length}/280
            </span>
          </div>
          <Textarea
            id="description"
            placeholder={
              selectedReason?.placeholder ??
              "Select a reason and share more context if needed."
            }
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-24 resize-y"
            rows={4}
            maxLength={280}
          />
          <p className="text-xs text-accent">
            Reports are private and reviewed by moderators.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button
            type="button"
            variant="card"
            onClick={() => handleOpenChange(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={!reason || isPending}>
            {isPending ? "Submitting..." : "Submit Report"}
          </Button>
        </div>
      </form>
    </SettingsDialogShell>
  );
}
