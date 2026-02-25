export interface BoardSummary {
    id: string;
    name: string;
    slug: string;
    allowAnonymous?: boolean;
}

export interface TagSummary {
    id: string;
    name: string;
    slug: string;
    color?: string | null;
}

export interface PostUser {
    name?: string;
    image?: string | null;
}

export interface SimilarPost {
    id: string;
    title: string;
    slug: string;
    upvotes: number | null;
    commentCount: number | null;
}
