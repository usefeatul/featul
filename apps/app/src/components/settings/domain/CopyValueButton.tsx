"use client";

import React from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { LoadingButton } from "@/components/global/loading-button";

type CopyValueButtonProps = {
  value: string;
  label: string;
  className?: string;
};

export default function CopyValueButton({
  value,
  label,
  className,
}: CopyValueButtonProps) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Copied");
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <LoadingButton
      type="button"
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      variant="ghost"
      size="icon-sm"
      className={
        className || "size-6 rounded-sm border border-border/60 p-0 hover:bg-muted/70"
      }
      onClick={handleCopy}
    >
      <Copy className="size-3.5" />
    </LoadingButton>
  );
}
