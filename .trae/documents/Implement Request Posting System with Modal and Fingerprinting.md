I will implement the comprehensive request posting system with fingerprint support and a modal interface.

## 1. Backend Implementation
### 1.1 Validators
- Modify `packages/api/src/validators/post.ts` to add `createPostSchema` with fields:
  - `title`: string (min 1, max 128)
  - `content`: string (min 1)
  - `workspaceSlug`: string
  - `boardSlug`: string
  - `fingerprint`: string (optional, for anonymous)

### 1.2 Router
- Modify `packages/api/src/router/post.ts` to implement `create` procedure:
  - Validate inputs using `createPostSchema`
  - Resolve Workspace and Board from slugs
  - Check permissions:
    - Allow if user is authenticated
    - Allow if board `allowAnonymous` is true (require fingerprint)
    - Deny otherwise
  - Handle anonymous user identification (set `isAnonymous=true`, store fingerprint in `metadata`)
  - Create post slug from title
  - Insert post into database
  - Auto-upvote the post for the creator (user or anonymous)
  - Return the created post

## 2. Frontend Implementation
### 2.1 Create Post Modal
- Create `apps/feed/src/components/subdomain/CreatePostModal.tsx`:
  - Use `Dialog` component
  - Implement form with Title and Content fields
  - Handle submission using the new `post.create` API
  - Integrate `getBrowserFingerprint` for anonymous users
  - Display user avatar (if logged in) or placeholder
  - Show validation errors

### 2.2 Submit Idea Card
- Modify `apps/feed/src/components/subdomain/SubmitIdeaCard.tsx`:
  - Replace the existing Link with a Button that triggers `CreatePostModal`
  - Pass `workspaceSlug` (subdomain) and `boardSlug` to the modal

### 2.3 Sidebar & Layout Updates
- Modify `apps/feed/src/components/subdomain/DomainSidebar.tsx`:
  - Add `hideSubmitButton` prop
  - Conditionally render `SubmitIdeaCard` based on this prop
- Modify `apps/feed/src/components/subdomain/DomainPageLayout.tsx`:
  - Add `hideSubmitButton` prop and pass it to `DomainSidebar`
- Modify `apps/feed/src/app/[subdomain]/roadmap/page.tsx` and `changelog/page.tsx`:
  - Pass `hideSubmitButton={true}` to `DomainPageLayout` to satisfy the requirement of positioning the modal adjacent to all boards *except* Roadmap and Changelog.

## 3. Database
- Ensure `post` table schema supports necessary fields (verified: `isAnonymous` exists, `metadata` can store fingerprint).
