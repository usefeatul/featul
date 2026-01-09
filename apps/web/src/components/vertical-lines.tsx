"use client";

import { usePathname } from "next/navigation";

export function VerticalLines() {
    const pathname = usePathname();

    // Hide on docs pages
    if (pathname?.startsWith("/docs")) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[60] mx-auto max-w-6xl pointer-events-none px-1 md:px-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.06)_100%),linear-gradient(to_bottom,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.06)_100%)] bg-[length:1px_100%] bg-[position:left_top,right_top] bg-no-repeat bg-origin-content"
        />
    );
}
