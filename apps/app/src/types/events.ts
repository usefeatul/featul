export interface PostDeletedEventDetail {
  postId: string;
  workspaceSlug: string;
  status: string | null;
}

export interface RequestsPageRefreshingDetail {
  workspaceSlug: string;
}

export interface ChangelogDeletedEventDetail {
  entryId: string;
  workspaceSlug: string;
}

export interface ChangelogPageRefreshingDetail {
  workspaceSlug: string;
}

export interface WorkspaceScopedEventDetail {
  workspaceSlug: string;
}
