import React from "react";
import { AuthFooter } from "@/components/auth/AuthFooter";
import WizardPreview from "@/components/wizard/WizardPreview";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-card p-4">
      <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden lg:grid-cols-2 lg:gap-4">
        <div className="relative flex min-h-0 flex-col overflow-y-auto overscroll-none bg-card px-4 pt-6 pb-0 sm:px-8">
          <main className="flex min-h-0 flex-1 items-center justify-center">
            {children}
          </main>
          <AuthFooter />
        </div>

        <WizardPreview />
      </div>
    </div>
  );
}
