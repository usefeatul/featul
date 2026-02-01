import { SubmitIdeaCard } from "../SubmitIdeaCard";
import { ChangelogAuthorCard } from "./ChangelogAuthorCard";
import { PoweredBy } from "../PoweredBy";
import type { Role } from "@/types/team";

interface ChangelogSidebarProps {
    subdomain: string;
    author?: {
        name?: string | null;
        image?: string | null;
        role?: Role | null;
        isOwner?: boolean;
    };
    publishedAt?: string | Date | null;
}

export function ChangelogSidebar({ subdomain, author, publishedAt }: ChangelogSidebarProps) {
    return (
        <aside className="hidden md:block space-y-4">
            {/* Got an idea card */}
            <SubmitIdeaCard subdomain={subdomain} slug={subdomain} />

            {/* Author Card */}
            <ChangelogAuthorCard author={author} publishedAt={publishedAt} />

            {/* Powered By */}
            <PoweredBy />
        </aside>
    );
}
