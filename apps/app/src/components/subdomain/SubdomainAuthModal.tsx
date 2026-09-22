"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogInner,
  DialogTitle,
} from "@featul/ui/components/dialog";
import { AccountIcon } from "@featul/ui/icons/account";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";
import type { AuthMode } from "@/types/auth";

export default function SubdomainAuthModal({
  open,
  onOpenChange,
  mode,
  redirectTo,
  onModeChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AuthMode;
  redirectTo?: string;
  onModeChange: (mode: AuthMode) => void;
}) {
  const title = mode === "sign-in" ? "Sign in" : "Sign up";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent fluid className="w-[min(90vw,400px)]">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
          <DialogTitle className="flex items-center gap-2 px-2 mt-0.5 py-0.5 text-sm font-normal">
            <AccountIcon className="size-3.5 text-primary" />
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogInner className="max-h-[66vh] overflow-y-auto pt-5 pb-4">
          {mode === "sign-in" ? (
            <SignIn
              redirectTo={redirectTo}
              embedded
              onSwitchMode={() => onModeChange("sign-up")}
            />
          ) : (
            <SignUp
              redirectTo={redirectTo}
              embedded
              onSwitchMode={() => onModeChange("sign-in")}
            />
          )}
        </DialogInner>
      </DialogContent>
    </Dialog>
  );
}
