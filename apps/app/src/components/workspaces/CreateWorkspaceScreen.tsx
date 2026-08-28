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
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-card p-3 sm:p-4">
      <header className="pointer-events-auto absolute top-6 right-6 z-20 sm:top-7 sm:right-7">
        <OnboardingUserMenu initialUser={initialUser} />
      </header>

      <div className="h-full min-h-0">
        <WorkspaceWizard isFirstWorkspace={isFirstWorkspace} />
      </div>
    </div>
  );
}
