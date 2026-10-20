import React from "react";
import Link from "next/link";
import { ChevronLeft } from "@/components/global/icons";

interface ChangelogHeaderProps {
    backLink?: string;
}

/** Plain back link above the entry, inside the content column. */
export function ChangelogHeader({ backLink = "/changelog" }: ChangelogHeaderProps) {
    return (
        <Link
            href={backLink}
            className="-ml-1 mb-5 inline-flex w-fit items-center gap-1 rounded-md px-1 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
            <ChevronLeft className="size-4" />
            Back to changelog
        </Link>
    );
}
