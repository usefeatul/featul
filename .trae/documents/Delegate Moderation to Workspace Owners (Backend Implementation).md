I recommend that you **delegate moderation to your Workspace Owners**. This empowers your users to manage their own communities while saving you from being the bottleneck for every reported comment.

### Why this approach?
1.  **Scalability:** As your user base grows, you cannot manually review every report.
2.  **Context:** Workspace owners understand their community's context better than you do.
3.  **Empowerment:** It gives your customers control over their data and user experience.
4.  **Safety Net:** As a "Super Admin," you can still intervene if necessary, but the day-to-day should be theirs.

### Implementation Plan

To enable Workspace Owners to moderate, we need to build the backend infrastructure for them to view and resolve reports.

#### 1. Update Backend API (`packages/api/src/router/comment.ts`)
I will add two new procedures to the `comment` router:

*   **`listReports`**: Allows a workspace owner to see all pending reports for their workspace.
    *   **Input:** `workspaceId`
    *   **Auth Logic:** Verifies that the requesting user is the owner or an admin of the specified workspace.
    *   **Query:** Joins `commentReport` -> `comment` -> `post` -> `board` -> `workspace` to filter reports belonging to that workspace.
*   **`resolveReport`**: Allows a workspace owner to take action on a report.
    *   **Input:** `reportId`, `action` ("dismiss", "delete_comment"), `resolution` (optional text).
    *   **Logic:**
        *   If `dismiss`: Updates report status to `dismissed`.
        *   If `delete_comment`: Updates report status to `resolved`, deletes the comment content (soft delete), and marks the resolution.

#### 2. Frontend "Moderation Queue" (Future Step)
Once the API is ready, you (or we) can build a simple "Moderation" tab in the Workspace Settings dashboard where owners can:
1.  See a list of reported comments.
2.  See the reason (Spam, Harassment, etc.) and description.
3.  Click "Keep" (Dismiss) or "Delete" (Resolve).

This plan focuses on the **backend implementation** first to make the data available.

**Shall I proceed with adding these API endpoints?**