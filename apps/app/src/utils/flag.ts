/**
 * Utility functions for flag-related styling (pinned, featured).
 */

/**
 * Get the CSS classes for highlighting list items based on pinned/featured status.
 * Uses left border design which is compact for list views.
 * 
 * @param isPinned - Whether the item is pinned
 * @param isFeatured - Whether the item is featured
 * @returns Tailwind CSS classes string
 */
export function getFlagHighlightClasses(isPinned?: boolean, isFeatured?: boolean): string {
    const pinnedClasses = "border-l-2 border-l-primary bg-primary/5 rounded-l-[5px]"
    const featuredClasses = "border-l-2 border-l-amber-500 bg-amber-500/5 rounded-l-[5px]"
    const bothClasses = "border-l-2 border-l-transparent bg-gradient-to-b from-primary/5 to-amber-500/5 rounded-l-[5px] relative before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-primary before:to-amber-500 before:rounded-l-[5px]"

    if (isPinned && isFeatured) return bothClasses
    if (isPinned) return pinnedClasses
    if (isFeatured) return featuredClasses
    return ""
}

/**
 * Check if an item has any flags (pinned or featured)
 */
export function hasFlags(isPinned?: boolean, isFeatured?: boolean): boolean {
    return Boolean(isPinned || isFeatured)
}
