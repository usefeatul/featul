import React from "react";
import WizardPreview from "@/components/wizard/WizardPreview";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 overflow-hidden overscroll-none bg-card p-4">
      <div className="grid h-full min-h-0 w-full grid-cols-1 overflow-hidden lg:grid-cols-2 lg:gap-4">
        <WizardPreview />

        <div className="relative flex min-h-0 items-center justify-center overflow-y-auto overscroll-none bg-card px-4 py-6 sm:px-8">
          <main className="w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
