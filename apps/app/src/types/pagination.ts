/** Shared pager props; variant switches copy and URL shape. */
export type RequestPaginationProps = {
  workspaceSlug: string;
  page: number;
  pageSize: number;
  totalCount: number;
  variant?: "requests" | "workspace" | "changelog";
};
