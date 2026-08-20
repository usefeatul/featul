"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogInner,
  DialogTitle,
} from "@featul/ui/components/dialog";
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
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogInner className="max-h-[66vh] overflow-y-auto p-0">
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
