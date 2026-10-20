"use client";

import { useEffect, useState } from "react";
import { Button } from "@featul/ui/components/button";
import { Check, Copy } from "@/components/global/icons";
import { toast } from "sonner";

export default function CopyButton({
  text,
  html,
  label = "Copy",
  iconOnly = false,
  primary = false,
}: {
  text: string;
  html?: string;
  label?: string;
  iconOnly?: boolean;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  async function copy() {
    try {
      if (
        html &&
        typeof ClipboardItem !== "undefined" &&
        navigator.clipboard?.write
      ) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({
              "text/plain": new Blob([text], { type: "text/plain" }),
              "text/html": new Blob([html], { type: "text/html" }),
            }),
          ]);
        } catch {
          await navigator.clipboard.writeText(text);
        }
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopied(true);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Couldn’t copy. Select the text and copy it manually.");
    }
  }

  const Icon = copied ? Check : Copy;
  return (
    <Button
      type="button"
      variant={primary ? "default" : "card"}
      size={iconOnly ? "icon-sm" : "sm"}
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
      className="shrink-0 gap-1.5"
    >
      <Icon className="size-3.5" />
      {!iconOnly ? (copied ? "Copied" : label) : null}
    </Button>
  );
}
