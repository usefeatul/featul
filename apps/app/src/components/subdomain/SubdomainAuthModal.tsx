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
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: AuthMode;
  redirectTo?: string;
}) {
  const title = mode === "sign-in" ? "Sign in" : "Sign up";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        fluid
        showCloseButton
        className="p-0 bg-transparent border-none shadow-none ring-0 ring-offset-0"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {mode === "sign-in" ? <SignIn redirectTo={redirectTo} /> : <SignUp redirectTo={redirectTo} />}
      </DialogContent>
    </Dialog>
  );
}
