import type { ActivityAction } from "@featul/api/activity/actions";

export interface TagSummary {
    id?: string;
    name?: string;
    slug?: string;
    color?: string;
}

/** Diff-style fields for activity rows (status and tag changes). */
export interface ActivityMetadata {
    tagSummaries?: TagSummary[];
    tags?: TagSummary[];
    status?: string;
    roadmapStatus?: string;
    fromStatus?: string;
    toStatus?: string;
    hasTagsChange?: boolean;
    hasTagsAdded?: boolean;
    hasTagsRemoved?: boolean;
    color?: string;
    slug?: string;
    [key: string]: unknown;
}

export interface ActivityItem {
    id: string;
    type: ActivityAction | string;
    entity?: string;
    entityId?: string;
    title?: string;
    summary?: string;
    status?: string;
    metadata?: ActivityMetadata;
    createdAt: string | Date;
}

/** Activity page plus nextCursor for infinite scroll. */
export interface PaginatedActivity {
    items: ActivityItem[];
    nextCursor: string | null;
}
