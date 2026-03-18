import type { ActivityAction } from "@featul/api/shared/activity-actions";

export interface TagSummary {
    id?: string;
    name?: string;
    slug?: string;
    color?: string;
}

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

export interface PaginatedActivity {
    items: ActivityItem[];
    nextCursor: string | null;
}
