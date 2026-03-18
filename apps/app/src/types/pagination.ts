export type RequestPaginationProps = {
  workspaceSlug: string;
  page: number;
  pageSize: number;
  totalCount: number;
  variant?: "requests" | "workspace" | "changelog";
};
