I will refactor the `CreatePostModal.tsx` component by breaking it down into smaller, modular components within a new `post` directory.

## 1. Create Directory Structure
- Create `apps/feed/src/components/subdomain/post/` directory.

## 2. Create Sub-components
I will create the following component files in `apps/feed/src/components/subdomain/post/`:

### 2.1 `PostHeader.tsx`
- **Responsibilities**: Renders the top section including:
  - User Avatar
  - Chevron separator
  - Board Selector Popover (logic for selection will be passed as props)
  - Close button (`XMarkIcon`)
- **Props**:
  - `user`: User object (name, image)
  - `initials`: string
  - `boards`: Array of board objects
  - `selectedBoard`: Currently selected board object
  - `onSelectBoard`: Callback function
  - `onClose`: Callback function for closing the modal

### 2.2 `PostContent.tsx`
- **Responsibilities**: Renders the input fields for Title and Content.
- **Props**:
  - `title`: string
  - `setTitle`: function
  - `content`: string
  - `setContent`: function

### 2.3 `PostFooter.tsx`
- **Responsibilities**: Renders the bottom section including:
  - Image upload button (placeholder)
  - Submit button
- **Props**:
  - `isPending`: boolean
  - `disabled`: boolean
  - `onSubmit`: function (for the button click, though the form handles submit)

## 3. Refactor `CreatePostModal.tsx`
- **Update**: `apps/feed/src/components/subdomain/CreatePostModal.tsx`
- **Changes**:
  - Import the new components: `PostHeader`, `PostContent`, `PostFooter`.
  - Maintain the state management (`title`, `content`, `boards`, `selectedBoard`, `user`) and effects (`auth`, `fetch boards`).
  - Maintain the form submission logic (`handleSubmit`).
  - Replace the JSX sections with the new components.
  - Ensure the `Dialog` wrapper remains the entry point.

## 4. Verification
- Verify all imports are correct.
- Ensure types are properly defined for all props.
- Confirm functionality (fetching boards, selecting board, submitting post, closing modal) remains unchanged.
- Confirm styling matches the current implementation (including the recent updates like `bg-muted` footer and top positioning).
