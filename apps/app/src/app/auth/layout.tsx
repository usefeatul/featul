import React from "react";
import Link from "next/link";
import { FeatulLogoIcon } from "@featul/ui/icons/featul-logo";
import { AuthFooter } from "@/components/auth/AuthFooter";

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="fixed inset-0 w-full flex flex-col bg-background overflow-hidden overscroll-none">
            <nav className="absolute left-0 top-0 p-6 sm:p-8 z-50">
                <Link href="/" className="flex items-center gap-2">
                    <FeatulLogoIcon className="h-8 w-8" />
                </Link>
            </nav>
            <div className="flex-1 flex flex-col overflow-y-auto overscroll-none">
                <main className="flex-1 flex flex-col">
                    {children}
                </main>
                <AuthFooter />
            </div>
        </div>
    );
}
