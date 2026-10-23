import type { Role } from "./team";

/**
 * Changelog tag type
 */
/** A changelog tag defined in workspace settings, selectable on an entry. */
export interface WorkspaceTag {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
}

export interface ChangelogTag {
    id: string;
    name: string;
    slug?: string;
    color?: string | null;
    count?: number;
}

/**
 * Author information for changelog entries
 */
export interface ChangelogAuthor {
    name?: string | null;
    image?: string | null;
    role?: Role | null;
    isOwner?: boolean;
}

/**
 * TipTap JSON content node structure
 */
export interface TiptapNode {
    type: string;
    text?: string;
    content?: TiptapNode[];
    attrs?: Record<string, unknown>;
    marks?: Array<{ type: string; attrs?: Record<string, unknown> }>;
}

/**
 * TipTap document structure
 */
export interface TiptapContent {
    type: "doc";
    content?: TiptapNode[];
}

/**
 * Full changelog entry type
 */
export interface ChangelogEntry {
    id: string;
    title: string;
    slug: string;
    summary?: string | null;
    content?: TiptapContent | string | null;
    coverImage?: string | null;
    publishedAt?: string | Date | null;
    status?: "draft" | "published" | "archived";
    author?: ChangelogAuthor;
    tags?: ChangelogTag[];
}

/**
 * API response type for entries list
 */
export interface ChangelogEntriesListResponse {
    entries: ChangelogEntry[];
    total: number;
}

/**
 * API response type for single entry
 */
export interface ChangelogEntryGetResponse {
    entry: ChangelogEntry | null;
}

/**
 * Extracts plain text from TipTap content recursively
 */
export function extractTextFromTiptap(content: TiptapContent | string | null | undefined): string {
    if (!content) return "";
    if (typeof content === "string") {
        return content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    const extractText = (node: TiptapNode): string => {
        if (node.text) return node.text;
        if (node.content && Array.isArray(node.content)) {
            return node.content.map(extractText).join(" ");
        }
        return "";
    };

    if (content.content && Array.isArray(content.content)) {
        return content.content.map(extractText).join(" ").replace(/\s+/g, " ").trim();
    }
    return "";
}
