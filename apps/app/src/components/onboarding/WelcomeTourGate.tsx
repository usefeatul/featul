"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { WelcomeTourDialog } from "./WelcomeTourDialog";
import {
  hasCompletedWelcomeTour,
  hasPendingWelcomeTour,
  markWelcomeTourCompleted,
  clearPendingWelcomeTour,
} from "@/lib/welcome/tour";

type WelcomeTourGateProps = {
  userId: string;
  workspaceName: string;
  workspaceSlug: string;
};

export function WelcomeTourGate({
  userId,
  workspaceName,
  workspaceSlug,
}: WelcomeTourGateProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const shouldWelcome =
      searchParams.get("welcome") === "1" || hasPendingWelcomeTour();
    if (!shouldWelcome || hasCompletedWelcomeTour(userId)) {
      return;
    }
    setOpen(true);
  }, [searchParams, userId]);

  const clearWelcomeParam = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (!params.has("welcome")) return;
    params.delete("welcome");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [pathname, router, searchParams]);

  const handleComplete = React.useCallback(() => {
    markWelcomeTourCompleted(userId);
    clearPendingWelcomeTour();
    clearWelcomeParam();
  }, [clearWelcomeParam, userId]);

  return (
    <WelcomeTourDialog
      open={open}
      onOpenChange={setOpen}
      onComplete={handleComplete}
      workspaceName={workspaceName}
      workspaceSlug={workspaceSlug}
    />
  );
}
