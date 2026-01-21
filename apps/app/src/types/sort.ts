/** Valid sort order values for requests/posts lists */
export type SortOrder = "newest" | "oldest" | "likes"

/** Configuration for a sort option */
export interface SortOption {
    value: SortOrder
    label: string
}

/** Available sort options for requests list */
export const SORT_OPTIONS: SortOption[] = [
    { value: "newest", label: "Newest" },
    { value: "oldest", label: "Oldest" },
    { value: "likes", label: "Most Liked" },
]

/** Parse sort order with validation, defaulting to "newest" */
export function parseSortOrder(value: string | null | undefined): SortOrder {
    const normalized = (value || "").toLowerCase()
    if (normalized === "oldest" || normalized === "likes") return normalized
    return "newest"
}
