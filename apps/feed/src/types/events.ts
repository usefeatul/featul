export interface PostDeletedEventDetail {
  postId: string
  workspaceSlug: string
  status: string | null
}

export interface RequestsPageRefreshingDetail {
  workspaceSlug: string
}
