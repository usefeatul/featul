/**
 * Changelog tag type for API operations
 */
export interface ChangelogTag {
    id: string;
    name: string;
    slug: string;
    color: string | null;
}

/**
 * Type guard for checking if a value is a valid changelog tags array
 */
export function isChangelogTagArray(value: unknown): value is ChangelogTag[] {
    return Array.isArray(value) && value.every(
        (item) => typeof item === 'object' && item !== null &&
            'id' in item && 'name' in item && 'slug' in item
    );
}

/**
 * Safely extract changelog tags from a board's changelogTags field
 */
export function getChangelogTags(changelogTags: unknown): ChangelogTag[] {
    if (!changelogTags) return [];
    if (!Array.isArray(changelogTags)) return [];

    const result: ChangelogTag[] = [];
    for (const t of changelogTags) {
        if (typeof t !== 'object' || t === null) continue;
        const tag = t as Record<string, unknown>;
        if (!tag.id || !tag.name) continue;
        result.push({
            id: String(tag.id),
            name: String(tag.name),
            slug: String(tag.slug || ''),
            color: typeof tag.color === 'string' ? tag.color : null,
        });
    }
    return result;
}

/**
 * Find tags by their IDs from the full tags array
 */
export function findTagsByIds(allTags: ChangelogTag[], ids: string[]): ChangelogTag[] {
    const tagsMap = new Map(allTags.map(t => [t.id, t]));
    return ids.map(id => tagsMap.get(id)).filter((t): t is ChangelogTag => t !== undefined);
}

/**
 * Create a map of tag IDs to tag objects for efficient lookup
 */
export function createTagsMap(tags: ChangelogTag[]): Map<string, ChangelogTag> {
    return new Map(tags.map(t => [t.id, t]));
}
