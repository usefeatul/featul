"use client";

import { toast } from "sonner";
import type { ImportSummary } from "@/types/notra";

type MessagePayload = {
  message?: unknown;
};

export async function readMessageFromResponse(
  response: Response,
): Promise<string | null> {
  const payload = (await response
    .json()
    .catch(() => null)) as MessagePayload | null;
  const message = payload?.message;
  return typeof message === "string" && message.trim() ? message : null;
}

export function showImportSummaryToasts(summary: ImportSummary) {
  toast.success(
    `Synced ${summary.importedCount} entries (${summary.createdCount} created, ${summary.updatedCount} updated).`,
  );
  if (summary.skippedCount > 0) {
    toast.success(`${summary.skippedCount} entries were skipped.`);
  }
  if (summary.truncatedCount > 0) {
    toast.success(
      `${summary.truncatedCount} items were truncated to fit import safety limits.`,
    );
  }
  if (summary.limitReached) {
    toast.error("Changelog entry limit reached for your current plan.");
  }
}
