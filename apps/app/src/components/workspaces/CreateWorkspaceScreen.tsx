"use client";

import React from "react";
import OnboardingUserMenu from "@/components/account/OnboardingUserMenu";
import type { UserIdentity } from "@/components/account/types";
import WorkspaceWizard from "@/components/wizard/Wizard";

export function CreateWorkspaceScreen({
  initialUser,
  isFirstWorkspace = false,
}: {
  initialUser?: UserIdentity;
  isFirstWorkspace?: boolean;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-background">
      <header className="pointer-events-auto absolute top-3 right-3 z-20 sm:top-4 sm:right-4">
        <OnboardingUserMenu initialUser={initialUser} />
      </header>

      <div className="h-full min-h-0">
        <WorkspaceWizard isFirstWorkspace={isFirstWorkspace} />
      </div>
    </div>
  );
}
