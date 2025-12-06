I will redesign the comment edit functionality in `apps/feed/src/components/comments/CommentItem.tsx` to provide a seamless, button-less experience.

### Plan:
1.  **Modify `CommentItem.tsx`**:
    *   Update the `isEditing` state handling to remove the explicit "Save" and "Cancel" buttons.
    *   Replace the inline edit form with a streamlined `Textarea` setup.
    *   Implement a `handleKeyDown` function to detect:
        *   **Tab**: Triggers save and allows focus to move (Auto-save).
        *   **Enter** (without Shift): Triggers save and maintains focus (Auto-save).
        *   **Escape**: Triggers cancel (Auto-cancel).
    *   Implement a `handleBlur` function to detect when the user clicks away, triggering a cancel action.
    *   Add a `useRef` to track the "saving" state to prevent race conditions between `Tab` (save) and `Blur` (cancel).
    *   Implement a debounced save function (300ms) to satisfy the technical requirement and prevent rapid-fire API calls.
    *   Add the required instructional text below the input: *"Press Enter/Tab to save • Press Esc or click away to cancel"*.
    *   Ensure accessibility by adding `aria-label` and associating the instructional text via `aria-describedby`.
    *   Maintain existing validation (prevent empty saves) and error handling (toast notifications).

### Technical Details:
-   **File**: `apps/feed/src/components/comments/CommentItem.tsx`
-   **Logic**:
    -   Use `useRef` for `isSaving` to coordinate between `KeyDown` and `Blur`.
    -   Use `useCallback` and a standard debounce approach (or `setTimeout`) for the save operation.
    -   Bind `onKeyDown` and `onBlur` to the `Textarea`.
    -   Ensure `autoFocus` is enabled on the `Textarea` when entering edit mode.
