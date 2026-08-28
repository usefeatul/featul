"use client";

import React from "react";
import { useRouter } from "next/navigation";
import OnboardingUserMenu from "@/components/account/OnboardingUserMenu";
import type { UserIdentity } from "@/components/account/types";
import WorkspaceWizard from "@/components/wizard/Wizard";
import { Button } from "@featul/ui/components/button";
import { XMarkIcon } from "@featul/ui/icons/xmark";

export function CreateWorkspaceScreen({
  initialUser,
  isFirstWorkspace = false,
}: {
  initialUser?: UserIdentity;
  isFirstWorkspace?: boolean;
}) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-background">
      <header className="pointer-events-auto absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
        <div className="flex items-center gap-2">
          {!isFirstWorkspace ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-8"
              aria-label="Close"
              onClick={() => {
                try {
                  router.back();
                } catch {
                  router.push("/");
                }
              }}
            >
              <XMarkIcon className="size-3.5" />
            </Button>
          ) : null}
          <OnboardingUserMenu initialUser={initialUser} />
        </div>
      </header>

      <div className="h-full min-h-0">
        <WorkspaceWizard isFirstWorkspace={isFirstWorkspace} />
      </div>
    </div>
  );
}
