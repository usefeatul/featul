"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@featul/ui/components/dialog";
import SignIn from "@/components/auth/SignIn";
import SignUp from "@/components/auth/SignUp";

export type AuthMode = "sign-in" | "sign-up";

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
      <DialogContent
        fluid
        showCloseButton={false}
        className="bg-transparent border-none shadow-none ring-0 ring-offset-0 p-2"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="w-[min(90vw,400px)] max-h-[66vh] overflow-y-auto rounded-2xl bg-background border border-border shadow-xl">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
