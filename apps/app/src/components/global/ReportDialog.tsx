"use client";

import React, { useState, useTransition } from "react";
import { SettingsDialogShell } from "@/components/settings/global/SettingsDialogShell";
import { REPORT_REASONS, type ReportReason } from "@/types/request";
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
import { FlagIcon } from "@featul/ui/icons/flag";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";

type ReportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  successMessage: string;
  errorMessage: string;
  onSubmitReport: (payload: {
    reason: ReportReason;
    description: string;
  }) => Promise<boolean>;
};

export function ReportDialog({
  open,
  onOpenChange,
  title,
  description,
  successMessage,
  errorMessage,
  onSubmitReport,
}: ReportDialogProps) {
  const [reason, setReason] = useState<ReportReason | "">("");
  const [reasonOpen, setReasonOpen] = useState(false);
  const [details, setDetails] = useState("");
  const [isPending, startTransition] = useTransition();
  const selectedReason = REPORT_REASONS.find((item) => item.value === reason);

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setReasonOpen(false);
      setReason("");
      setDetails("");
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reason) return;

    startTransition(async () => {
      try {
        const ok = await onSubmitReport({
          reason,
          description: details,
        });

        if (ok) {
          toast.success(successMessage);
          handleOpenChange(false);
          return;
        }

        toast.error(errorMessage);
      } catch (error) {
        console.error(errorMessage, error);
        toast.error(errorMessage);
      }
    });
  };

  return (
    <SettingsDialogShell
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
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
                variant="plain"
                role="combobox"
                aria-expanded={reasonOpen}
                className="h-auto min-h-11 w-full justify-between border border-border bg-background px-2 py-2 hover:bg-background"
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
              className="w-[320px] max-w-var(--radix-popover-trigger-width) p-0"
              align="start"
              list
            >
              <PopoverList>
                {REPORT_REASONS.map((item) => (
                  <PopoverListItem
                    key={item.value}
                    onClick={() => {
                      setReason(item.value);
                      setReasonOpen(false);
                    }}
                    className="items-start gap-2 py-2"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium leading-none">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {item.hint}
                      </p>
                    </div>
                    {reason === item.value ? (
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
            <Label htmlFor="report-description">
              Additional details{" "}
              <span className="text-muted-foreground text-xs font-normal">
                (Optional)
              </span>
            </Label>
            <span className="text-xs text-muted-foreground">
              {details.length}/280
            </span>
          </div>
          <Textarea
            id="report-description"
            placeholder={
              selectedReason?.placeholder ??
              "Select a reason and share more context if needed."
            }
            value={details}
            onChange={(event) => setDetails(event.target.value)}
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
