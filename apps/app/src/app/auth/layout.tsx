import React from "react";
import Link from "next/link";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { AuthFooter } from "@/components/auth/AuthFooter";
import { SkyBackdrop } from "@/components/global/SkyBackdrop";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 flex w-full flex-col overflow-hidden overscroll-none">
      <SkyBackdrop />
      <nav className="absolute left-0 top-0 z-20 p-6 sm:p-8">
        <Link
          href="/"
          aria-label="Go home"
          className="inline-flex items-center gap-2 text-white"
        >
          <FeatulLogoIcon className="size-8" />
          <span className="font-heading text-lg font-semibold tracking-tight">
            Featul
          </span>
        </Link>
      </nav>
      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto overscroll-none">
        <main className="flex flex-1 flex-col">{children}</main>
        <AuthFooter />
      </div>
    </div>
  );
}
